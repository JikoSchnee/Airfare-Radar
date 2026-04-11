import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { mockFlights } from '@/data/mockFlights';
import type { FlightTicket, SubscriptionNotice } from '@/types/flight';

export const useFlightsStore = defineStore('flights', () => {
  const flights = ref<FlightTicket[]>(mockFlights);
  const activeRoute = ref('dashboard');
  const subscriptions = ref<string[]>([]);
  const notifications = ref<SubscriptionNotice[]>([]);
  const searchQuery = ref('');
  const maxPrice = ref(2500);
  const directOnly = ref(false);
  const selectedAirline = ref('全部航司');
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

      const matchesKeyword =
        !keyword || searchableText.includes(keyword);
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

  return {
    flights,
    activeRoute,
    subscriptions,
    notifications,
    searchQuery,
    maxPrice,
    directOnly,
    selectedAirline,
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
    toggleSubscription,
    startSimulation,
    stopSimulation,
  };
});
