import axios from 'axios';
import { mockFlights } from '@/data/mockFlights';

const BOOKING_RAPIDAPI_KEY = '21fe37be52msh3379a23466e5741p13a328jsnf807a63f8169';
const BOOKING_RAPIDAPI_HOST = 'booking-com15.p.rapidapi.com';
const BOOKING_API_BASE_URL = 'https://booking-com15.p.rapidapi.com/api/v1';
const BOOKING_USER_API_KEY_STORAGE = 'airfare-radar:booking-user-api-key';
const BOOKING_USER_API_HOST_STORAGE = 'airfare-radar:booking-user-api-host';

const AERODATABOX_RAPIDAPI_KEY =
  import.meta.env.VITE_AERODATABOX_RAPIDAPI_KEY || '21fe37be52msh3379a23466e5741p13a328jsnf807a63f8169';
const AERODATABOX_RAPIDAPI_HOST =
  import.meta.env.VITE_AERODATABOX_RAPIDAPI_HOST || 'aerodatabox.p.rapidapi.com';
const AERODATABOX_API_BASE_URL = 'https://aerodatabox.p.rapidapi.com';
const LEARNING_FARES_ENDPOINT =
  import.meta.env.VITE_LEARNING_FARES_ENDPOINT || '/learning-fares-sample.json';

const CACHE_PREFIX = 'airfare-radar:search:';
const CACHE_TTL = 10 * 60 * 1000;

export const getBookingUserApiConfig = () => ({
  apiKey: window.localStorage.getItem(BOOKING_USER_API_KEY_STORAGE) || '',
  apiHost: window.localStorage.getItem(BOOKING_USER_API_HOST_STORAGE) || BOOKING_RAPIDAPI_HOST,
});

export const saveBookingUserApiConfig = ({ apiKey, apiHost }) => {
  window.localStorage.setItem(BOOKING_USER_API_KEY_STORAGE, apiKey.trim());
  window.localStorage.setItem(
    BOOKING_USER_API_HOST_STORAGE,
    (apiHost || BOOKING_RAPIDAPI_HOST).trim(),
  );
};

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const buildCacheKey = (provider, params) => {
  const normalized = Object.entries(params)
    .filter(([, value]) => value !== '' && value !== undefined && value !== null)
    .sort(([left], [right]) => left.localeCompare(right));

  return `${CACHE_PREFIX}${provider}:${JSON.stringify(normalized)}`;
};

const readCache = (cacheKey) => {
  const raw = window.localStorage.getItem(cacheKey);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (Date.now() - parsed.savedAt > CACHE_TTL) {
      window.localStorage.removeItem(cacheKey);
      return null;
    }

    return parsed.data;
  } catch {
    window.localStorage.removeItem(cacheKey);
    return null;
  }
};

const writeCache = (cacheKey, data) => {
  window.localStorage.setItem(
    cacheKey,
    JSON.stringify({
      savedAt: Date.now(),
      data,
    }),
  );
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getIataCodeFromId = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value.split('.')[0]?.trim().toUpperCase() || '';
};

const getMinutesBetween = (startValue, endValue) => {
  const start = new Date(startValue).getTime();
  const end = new Date(endValue).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 120;
  }

  return Math.max(60, Math.round((end - start) / 60000));
};

const formatLocalTime = (value) => {
  if (!value) {
    return '待定';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const stableHash = (value) =>
  String(value || '')
    .split('')
    .reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

const estimateReferencePrice = ({ flightNumber, isDirect, durationMinutes }) => {
  const durationHours = durationMinutes / 60;
  const base = 420 + durationHours * 180;
  const directBonus = isDirect ? 90 : 0;
  const variance = stableHash(flightNumber) % 180;

  return Math.max(260, Math.round(base + directBonus + variance));
};

const buildTags = (segmentsCount, isDirect, extraTags = []) => {
  const tags = [isDirect ? '直飞' : '含经停', ...extraTags];

  if (segmentsCount > 1) {
    tags.push(`${segmentsCount - 1} 次中转`);
  }

  return Array.from(new Set(tags));
};

const getBookingOffers = (payload) =>
  payload?.data?.flightOffers ||
  payload?.data?.offers ||
  payload?.data?.itineraries ||
  payload?.data ||
  payload?.flightOffers ||
  payload?.offers ||
  payload?.itineraries ||
  [];

const mapBookingOfferToFlightTicket = (offer, index) => {
  const itinerary = offer?.itinerary || offer?.itineraries?.[0] || offer?.legs?.[0] || {};
  const segments = itinerary?.segments || offer?.segments || [];
  const firstSegment = segments[0] || {};
  const lastSegment = segments[segments.length - 1] || firstSegment;

  const departureAirport = firstSegment?.departureAirport || offer?.departureAirport || {};
  const arrivalAirport = lastSegment?.arrivalAirport || offer?.arrivalAirport || {};
  const priceAverage =
    toNumber(offer?.price?.averagePrice) ||
    toNumber(offer?.priceBreakdown?.total?.units) ||
    toNumber(offer?.price?.total?.amount) ||
    toNumber(offer?.price?.amount) ||
    999;
  const originalPrice =
    toNumber(offer?.price?.oldPrice) ||
    toNumber(offer?.price?.roundedUpPrice) ||
    Math.round(priceAverage * 1.35);
  const airline =
    firstSegment?.carrierInfo?.operatingCarrier ||
    firstSegment?.carrierInfo?.marketingCarrier ||
    offer?.carriers?.[0]?.name ||
    'Booking.com API';
  const flightNumber =
    firstSegment?.flightNumber ||
    firstSegment?.carrierInfo?.flightNumber ||
    offer?.token?.slice(0, 8) ||
    `API-${index + 1}`;
  const isDirect = segments.length <= 1;

  return {
    id: offer?.token || offer?.id || `booking-${index}`,
    airline,
    flightNumber,
    isDirect,
    departure: {
      city: departureAirport?.cityName || departureAirport?.name || '未知出发地',
      code: departureAirport?.code || departureAirport?.iataCode || 'N/A',
      time: firstSegment?.departureTime || firstSegment?.departureDateTime || '待定',
    },
    destination: {
      city: arrivalAirport?.cityName || arrivalAirport?.name || '未知目的地',
      code: arrivalAirport?.code || arrivalAirport?.iataCode || 'N/A',
      time: lastSegment?.arrivalTime || lastSegment?.arrivalDateTime || '待定',
    },
    price: Math.max(99, Math.round(priceAverage)),
    originalPrice: Math.max(Math.round(originalPrice), Math.round(priceAverage)),
    discountRate: Number(
      (
        Math.max(99, Math.round(priceAverage)) /
        Math.max(Math.round(originalPrice), Math.round(priceAverage))
      ).toFixed(2),
    ),
    lastUpdated: new Date().toLocaleString('zh-CN', { hour12: false }),
    tags: buildTags(segments.length, isDirect, ['Booking 实时票价']),
  };
};

const normalizeBookingFlights = (payload) => {
  const offers = getBookingOffers(payload);

  if (!Array.isArray(offers) || !offers.length) {
    return [];
  }

  return offers.map(mapBookingOfferToFlightTicket);
};

const getMovementAirport = (flight) =>
  flight?.movement?.airport ||
  flight?.arrival?.airport ||
  flight?.departure?.airport ||
  {};

const getMovementTime = (flight, field) =>
  flight?.movement?.[field]?.local ||
  flight?.movement?.[field]?.utc ||
  flight?.departure?.[field]?.local ||
  flight?.departure?.[field]?.utc ||
  flight?.arrival?.[field]?.local ||
  flight?.arrival?.[field]?.utc ||
  '';

const mapAeroDataBoxFlightToTicket = (flight, index, fromCode) => {
  const airport = getMovementAirport(flight);
  const scheduledDeparture =
    getMovementTime(flight, 'scheduledTime') ||
    getMovementTime(flight, 'revisedTime') ||
    getMovementTime(flight, 'actualTime');
  const scheduledArrival =
    flight?.arrival?.scheduledTime?.local ||
    flight?.arrival?.revisedTime?.local ||
    flight?.arrival?.actualTime?.local ||
    getMovementTime(flight, 'scheduledTime');
  const flightNumber = flight?.number || `ADB-${index + 1}`;
  const isDirect = true;
  const durationMinutes = getMinutesBetween(scheduledDeparture, scheduledArrival);
  const estimatedPrice = estimateReferencePrice({
    flightNumber,
    isDirect,
    durationMinutes,
  });
  const originalPrice = Math.round(estimatedPrice * 1.45);

  return {
    id: `adb-${fromCode}-${flightNumber}-${index}`,
    airline: flight?.airline?.name || flight?.airline?.iata || 'AeroDataBox',
    flightNumber,
    isDirect,
    departure: {
      city: flight?.departure?.airport?.municipalityName || '未知出发地',
      code: flight?.departure?.airport?.iata || fromCode,
      time: formatLocalTime(scheduledDeparture),
    },
    destination: {
      city: airport?.municipalityName || airport?.shortName || airport?.iata || '未知目的地',
      code: airport?.iata || airport?.icao || 'N/A',
      time: formatLocalTime(scheduledArrival),
    },
    price: estimatedPrice,
    originalPrice,
    discountRate: Number((estimatedPrice / originalPrice).toFixed(2)),
    lastUpdated: new Date().toLocaleString('zh-CN', { hour12: false }),
    tags: buildTags(1, isDirect, ['AeroDataBox 航班动态', '票价为估算参考']),
  };
};

const normalizeAeroDataBoxFlights = (payload, params) => {
  const fromCode = getIataCodeFromId(params.fromId);
  const toCode = getIataCodeFromId(params.toId);
  const departures = Array.isArray(payload?.departures) ? payload.departures : [];

  const filtered = departures.filter((flight) => {
    const airport = getMovementAirport(flight);
    const destinationCode = airport?.iata || airport?.icao || '';

    if (!toCode) {
      return true;
    }

    return String(destinationCode).toUpperCase() === toCode;
  });

  const candidates = filtered.length ? filtered : departures;

  return candidates.slice(0, 20).map((flight, index) =>
    mapAeroDataBoxFlightToTicket(flight, index, fromCode),
  );
};

const fetchBookingFlights = async (params) => {
  const customConfig = getBookingUserApiConfig();
  const bookingApiKey = customConfig.apiKey || BOOKING_RAPIDAPI_KEY;
  const bookingApiHost = customConfig.apiHost || BOOKING_RAPIDAPI_HOST;

  const response = await axios.get(`${BOOKING_API_BASE_URL}/flights/searchFlights`, {
    params,
    headers: {
      'X-RapidAPI-Key': bookingApiKey,
      'X-RapidAPI-Host': bookingApiHost,
    },
  });

  return normalizeBookingFlights(response.data);
};

const fetchAeroDataBoxFlights = async (params) => {
  const fromCode = getIataCodeFromId(params.fromId);

  if (!fromCode) {
    throw new Error('AeroDataBox 需要可识别的出发机场 IATA 代码');
  }

  const fromLocal = `${params.departDate}T00:00`;
  const toLocal = `${params.departDate}T23:59`;

  const response = await axios.get(
    `${AERODATABOX_API_BASE_URL}/flights/airports/iata/${fromCode}/${fromLocal}/${toLocal}`,
    {
      params: {
        withLeg: true,
        withCancelled: false,
        withCodeshared: true,
        withCargo: false,
        withPrivate: false,
      },
      headers: {
        'X-RapidAPI-Key': AERODATABOX_RAPIDAPI_KEY,
        'X-RapidAPI-Host': AERODATABOX_RAPIDAPI_HOST,
      },
    },
  );

  return normalizeAeroDataBoxFlights(response.data, params);
};

const normalizeLearningFlights = (payload) => {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.flights)
      ? payload.flights
      : [];

  return items
    .map((item, index) => {
      const price = Math.max(99, Math.round(toNumber(item?.price, 0)));
      const originalPrice = Math.max(
        price,
        Math.round(toNumber(item?.originalPrice, price * 1.35)),
      );
      const isDirect = item?.isDirect ?? true;

      return {
        id: item?.id || `learning-${index}`,
        airline: item?.airline || '学习采集器',
        flightNumber: item?.flightNumber || `LEARN-${index + 1}`,
        isDirect,
        departure: {
          city: item?.departure?.city || '未知出发地',
          code: item?.departure?.code || 'N/A',
          time: item?.departure?.time || '待定',
        },
        destination: {
          city: item?.destination?.city || '未知目的地',
          code: item?.destination?.code || 'N/A',
          time: item?.destination?.time || '待定',
        },
        price,
        originalPrice,
        discountRate: Number((price / originalPrice).toFixed(2)),
        lastUpdated:
          item?.lastUpdated || new Date().toLocaleString('zh-CN', { hour12: false }),
        tags: buildTags(1, isDirect, [
          '学习采集器',
          ...(Array.isArray(item?.tags) ? item.tags : []),
        ]),
      };
    })
    .filter((item) => item.departure.city !== '未知出发地' && item.destination.city !== '未知目的地');
};

const fetchLearningFlights = async (params) => {
  const response = await axios.get(LEARNING_FARES_ENDPOINT, {
    params: {
      fromId: params.fromId,
      toId: params.toId,
      departDate: params.departDate,
    },
  });

  return normalizeLearningFlights(response.data);
};

const getProviderMeta = (provider) => {
  if (provider === 'aerodatabox') {
    return {
      label: 'AeroDataBox API',
      cacheLabel: 'AeroDataBox 本地缓存',
    };
  }

  if (provider === 'booking') {
    return {
      label: 'Booking.com API',
      cacheLabel: 'Booking 本地缓存',
    };
  }

  if (provider === 'learning') {
    return {
      label: '学习采集器',
      cacheLabel: '学习采集器本地缓存',
    };
  }

  return {
    label: '示例数据',
    cacheLabel: '示例数据缓存',
  };
};

export const fetchRealFlights = async (params) => {
  if (!isValidDate(params.departDate)) {
    throw new Error('出发日期格式必须是 YYYY-MM-DD');
  }

  if (params.returnDate && !isValidDate(params.returnDate)) {
    throw new Error('返程日期格式必须是 YYYY-MM-DD');
  }

  const provider = params.provider || 'aerodatabox';
  const { label, cacheLabel } = getProviderMeta(provider);
  const cacheKey = buildCacheKey(provider, params);
  const cached = readCache(cacheKey);

  if (cached?.length) {
    return {
      flights: cached,
      source: 'cache',
      provider,
      sourceLabel: cacheLabel,
    };
  }

  try {
    const flights =
      provider === 'aerodatabox'
        ? await fetchAeroDataBoxFlights(params)
        : provider === 'booking'
          ? await fetchBookingFlights(params)
          : provider === 'learning'
            ? await fetchLearningFlights(params)
          : mockFlights;

    if (flights.length) {
      writeCache(cacheKey, flights);

      return {
        flights,
        source: provider === 'mock' ? 'mock' : 'api',
        provider,
        sourceLabel: label,
        message:
          provider === 'aerodatabox'
            ? 'AeroDataBox 提供的是航班时刻与动态数据，票价字段为基于航线时长生成的参考估算。'
            : provider === 'learning'
              ? '当前使用学习采集器数据源。请仅接入你有权获取与使用的数据。'
            : undefined,
      };
    }

    return {
      flights: mockFlights,
      source: 'mock',
      provider,
      sourceLabel: '示例数据',
      message: `${label} 未返回可用结果，当前展示的是示例数据`,
    };
  } catch (error) {
    const status = error?.response?.status;

    if (status === 429) {
      return {
        flights: mockFlights,
        source: 'mock',
        provider,
        sourceLabel: '示例数据',
        message:
          provider === 'booking'
            ? 'Booking.com 加载失败，当前展示的是示例数据。你可以输入自己的 API Key 继续搜索。'
            : '当前展示的是示例数据',
        requireUserApi: provider === 'booking',
      };
    }

    if (status === 403) {
      return {
        flights: mockFlights,
        source: 'mock',
        provider,
        sourceLabel: '示例数据',
        message:
          provider === 'booking'
            ? 'Booking.com 返回 403，请输入你自己的 API Key。当前展示的是示例数据。'
            : `${label} 返回 403，请先确认已在 RapidAPI 中订阅该接口。当前展示的是示例数据`,
        requireUserApi: provider === 'booking',
      };
    }

    return {
      flights: mockFlights,
      source: 'mock',
      provider,
      sourceLabel: '示例数据',
      message:
        provider === 'booking'
          ? 'Booking.com 请求失败，当前展示的是示例数据。你可以输入自己的 API Key 后重试。'
          : `${label} 请求失败，当前展示的是示例数据`,
      requireUserApi: provider === 'booking',
    };
  }
};
