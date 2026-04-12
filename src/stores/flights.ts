import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { mockFlights } from '@/data/mockFlights';
import {
  fetchRealFlights,
  type FetchRealFlightsParams,
  type FlightApiProvider,
} from '@/services/apiService';
import type { FlightTicket, SubscriptionNotice } from '@/types/flight';

interface AirportSelection {
  id: string;
  label: string;
}

interface SearchDraft {
  origins: AirportSelection[];
  destinations: AirportSelection[];
  departDate: string;
  returnDate: string;
  cabinClass: string;
  adults: number;
  children: number;
  currency_code: string;
}

export const useFlightsStore = defineStore('flights', () => {
  const flights = ref<FlightTicket[]>(mockFlights);
  const activeRoute = ref('dashboard');
  const subscriptions = ref<string[]>([]);
  const notifications = ref<SubscriptionNotice[]>([]);
  const searchQuery = ref('');
  const maxPrice = ref(2500);
  const directOnly = ref(false);
  const selectedAirline = ref('全部航司');
  const selectedApiProvider = ref<FlightApiProvider>('booking');
  const isLoading = ref(false);
  const dataSourceLabel = ref('示例数据');
  const lastError = ref('');
  const shouldPromptBookingApi = ref(false);
  const hasSearchedRealFlights = ref(false);
  const searchDraft = ref<SearchDraft>({
    origins: [
      { id: 'SHA.AIRPORT', label: '上海 · 虹桥国际机场 (SHA)' },
      { id: 'PVG.AIRPORT', label: '上海 · 浦东国际机场 (PVG)' },
    ],
    destinations: [{ id: 'PEK.AIRPORT', label: '北京 · 首都国际机场 (PEK)' }],
    departDate: '2026-05-20',
    returnDate: '',
    cabinClass: 'ECONOMY',
    adults: 1,
    children: 0,
    currency_code: 'CNY',
  });
  const simulationStarted = ref(false);
  let simulationTimer: ReturnType<typeof setInterval> | null = null;

  const superDeals = computed(() =>
    flights.value.filter((flight) => flight.discountRate < 0.2),
  );

  const airlineOptions = computed(() => [
    '全部航司',
    ...new Set(flights.value.map((flight) => flight.airline)),
  ]);

  const cheapestFlight = computed(() =>
    [...flights.value].sort((left, right) => left.price - right.price)[0],
  );

  const averageDiscount = computed(() => {
    if (!flights.value.length) {
      return 0;
    }

    const total = flights.value.reduce(
      (sum, flight) => sum + flight.discountRate,
      0,
    );

    return total / flights.value.length;
  });

  const filteredFlights = computed(() => {
    const keyword = searchQuery.value.trim().toLowerCase();

    return flights.value.filter((flight) => {
      const searchableText = [
        flight.departure.city,
        flight.departure.code,
        flight.destination.city,
        flight.destination.code,
        flight.airline,
      ]
        .join(' ')
        .toLowerCase();

      const matchesKeyword = !keyword || searchableText.includes(keyword);
      const matchesPrice = flight.price <= maxPrice.value;
      const matchesDirect = !directOnly.value || flight.isDirect;
      const matchesAirline =
        selectedAirline.value === '全部航司' ||
        flight.airline === selectedAirline.value;

      return matchesKeyword && matchesPrice && matchesDirect && matchesAirline;
    });
  });

  const subscriptionFlights = computed(() =>
    subscriptions.value
      .map((id) => flights.value.find((flight) => flight.id === id))
      .filter((flight): flight is FlightTicket => Boolean(flight)),
  );

  const setActiveRoute = (routeName: string) => {
    activeRoute.value = routeName;
  };

  const setSearchQuery = (value: string) => {
    searchQuery.value = value;
  };

  const setMaxPrice = (value: number) => {
    maxPrice.value = value;
  };

  const setDirectOnly = (value: boolean) => {
    directOnly.value = value;
  };

  const setSelectedAirline = (value: string) => {
    selectedAirline.value = value;
  };

  const setSelectedApiProvider = (value: FlightApiProvider) => {
    selectedApiProvider.value = value;
  };

  const updateSearchDraft = (nextDraft: SearchDraft) => {
    searchDraft.value = nextDraft;
  };

  const pushNotice = (flightId: string, message: string) => {
    const notice: SubscriptionNotice = {
      id: `${flightId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      flightId,
      message,
      createdAt: Date.now(),
    };

    notifications.value = [notice, ...notifications.value].slice(0, 4);

    window.setTimeout(() => {
      notifications.value = notifications.value.filter((item) => item.id !== notice.id);
    }, 4800);
  };

  const requestBrowserNotification = async () => {
    if (!('Notification' in window) || Notification.permission !== 'default') {
      return;
    }

    try {
      await Notification.requestPermission();
    } catch {
      // Ignore notification permission failures and rely on in-app toast.
    }
  };

  const notifyPriceDrop = (flight: FlightTicket, previousPrice: number) => {
    const message = `${flight.departure.city} → ${flight.destination.city} 已降至 ¥${flight.price}，比刚才又便宜了 ¥${previousPrice - flight.price}`;

    pushNotice(flight.id, message);

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('AirFare Radar 降价提醒', {
        body: message,
      });
    }
  };

  const toggleSubscription = async (flightId: string) => {
    const flight = flights.value.find((item) => item.id === flightId);

    if (!flight) {
      return;
    }

    const exists = subscriptions.value.includes(flightId);

    if (exists) {
      subscriptions.value = subscriptions.value.filter((id) => id !== flightId);
      pushNotice(flightId, `${flight.departure.city} → ${flight.destination.city} 已取消降价提醒`);
      return;
    }

    subscriptions.value = [...subscriptions.value, flightId];
    await requestBrowserNotification();
    pushNotice(flightId, `${flight.departure.city} → ${flight.destination.city} 已加入降价提醒`);
  };

  const searchRealFlights = async (params: FetchRealFlightsParams) => {
    isLoading.value = true;
    lastError.value = '';

    try {
      const result = await fetchRealFlights(params);

      flights.value = result.flights;
      hasSearchedRealFlights.value = true;
      dataSourceLabel.value = result.sourceLabel;
      shouldPromptBookingApi.value = Boolean(result.requireUserApi);

      if (result.message) {
        lastError.value = result.message;
        pushNotice('system', result.message);
      }
    } catch (error) {
      flights.value = mockFlights;
      hasSearchedRealFlights.value = true;
      dataSourceLabel.value = '示例数据';
      shouldPromptBookingApi.value = Boolean(params.provider === 'booking');
      lastError.value =
        error instanceof Error ? error.message : '搜索失败，当前展示的是示例数据';
      pushNotice('system', '当前展示的是示例数据');
    } finally {
      isLoading.value = false;
    }
  };

  const mergeFlights = (items: FlightTicket[]) => {
    const flightMap = new Map<string, FlightTicket>();

    for (const flight of items) {
      const mergeKey = [
        flight.airline,
        flight.flightNumber,
        flight.departure.code,
        flight.departure.time,
        flight.destination.code,
        flight.destination.time,
      ].join('|');

      const existing = flightMap.get(mergeKey);

      if (!existing || flight.price < existing.price) {
        flightMap.set(mergeKey, flight);
      }
    }

    return [...flightMap.values()].sort((left, right) => left.price - right.price);
  };

  const searchAggregatedRealFlights = async (paramsList: FetchRealFlightsParams[]) => {
    if (!paramsList.length) {
      return;
    }

    isLoading.value = true;
    lastError.value = '';
    shouldPromptBookingApi.value = false;

    try {
      const settled = await Promise.all(paramsList.map((params) => fetchRealFlights(params)));
      const allFlights = mergeFlights(settled.flatMap((result) => result.flights));
      const firstResult = settled[0];
      const promptUserApi = settled.some((result) => result.requireUserApi);
      const messages = settled
        .map((result) => result.message)
        .filter((message): message is string => Boolean(message));

      flights.value = allFlights.length ? allFlights : mockFlights;
      hasSearchedRealFlights.value = true;
      shouldPromptBookingApi.value = promptUserApi;

      if (paramsList.length > 1) {
        dataSourceLabel.value = `${firstResult.sourceLabel} · 聚合 ${paramsList.length} 组机场`;
      } else {
        dataSourceLabel.value = firstResult.sourceLabel;
      }

      if (messages.length) {
        lastError.value = messages[0];
        pushNotice('system', messages[0]);
      }
    } catch (error) {
      const firstProvider = paramsList[0]?.provider;

      flights.value = mockFlights;
      hasSearchedRealFlights.value = true;
      dataSourceLabel.value = '示例数据';
      shouldPromptBookingApi.value = Boolean(firstProvider === 'booking');
      lastError.value =
        error instanceof Error ? error.message : '搜索失败，当前展示的是示例数据';
      pushNotice('system', '当前展示的是示例数据');
    } finally {
      isLoading.value = false;
    }
  };

  const startSimulation = () => {
    if (simulationStarted.value) {
      return;
    }

    simulationStarted.value = true;
    simulationTimer = window.setInterval(() => {
      if (!subscriptions.value.length) {
        return;
      }

      const pickedId =
        subscriptions.value[Math.floor(Math.random() * subscriptions.value.length)];
      const index = flights.value.findIndex((flight) => flight.id === pickedId);

      if (index === -1) {
        return;
      }

      const target = flights.value[index];
      const minAllowed = Math.max(99, Math.floor(target.price * 0.72));
      const drop = Math.max(15, Math.floor(Math.random() * 90));
      const nextPrice = Math.max(minAllowed, target.price - drop);

      if (nextPrice === target.price) {
        return;
      }

      const updatedFlight: FlightTicket = {
        ...target,
        price: nextPrice,
        discountRate: Number((nextPrice / target.originalPrice).toFixed(2)),
        lastUpdated: new Date().toLocaleString('zh-CN', {
          hour12: false,
        }),
      };

      const nextFlights = [...flights.value];
      nextFlights[index] = updatedFlight;
      flights.value = nextFlights;

      notifyPriceDrop(updatedFlight, target.price);
    }, 30000);
  };

  const stopSimulation = () => {
    if (simulationTimer) {
      clearInterval(simulationTimer);
      simulationTimer = null;
    }

    simulationStarted.value = false;
  };

  const setShouldPromptBookingApi = (value: boolean) => {
    shouldPromptBookingApi.value = value;
  };

  return {
    flights,
    activeRoute,
    subscriptions,
    notifications,
    searchQuery,
    maxPrice,
    directOnly,
    selectedAirline,
    selectedApiProvider,
    isLoading,
    dataSourceLabel,
    lastError,
    shouldPromptBookingApi,
    hasSearchedRealFlights,
    searchDraft,
    superDeals,
    airlineOptions,
    cheapestFlight,
    averageDiscount,
    filteredFlights,
    subscriptionFlights,
    setActiveRoute,
    setSearchQuery,
    setMaxPrice,
    setDirectOnly,
    setSelectedAirline,
    setSelectedApiProvider,
    setShouldPromptBookingApi,
    updateSearchDraft,
    toggleSubscription,
    searchRealFlights,
    searchAggregatedRealFlights,
    startSimulation,
    stopSimulation,
  };
});
