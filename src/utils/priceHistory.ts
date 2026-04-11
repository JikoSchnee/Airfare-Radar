import type { FlightTicket } from '@/types/flight';

export interface PriceHistoryPoint {
  date: string;
  price: number;
}

const formatDateLabel = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${month}-${day}`;
};

// Generate deterministic mock price history so each ticket has a stable 30-day trend.
export const buildPriceHistory = (flight: FlightTicket): PriceHistoryPoint[] => {
  const history: PriceHistoryPoint[] = [];
  const today = new Date('2026-04-11T12:00:00');
  const baseSeed = flight.id
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  for (let index = 29; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);

    const wave = Math.sin((index + baseSeed) / 3.2) * 65;
    const drift = index * 7;
    const randomOffset = ((baseSeed * (index + 11)) % 37) - 18;
    const rawPrice = flight.price + drift + wave + randomOffset;
    const boundedPrice = Math.min(
      flight.originalPrice,
      Math.max(flight.price - 90, Math.round(rawPrice)),
    );

    history.push({
      date: formatDateLabel(date),
      price: boundedPrice,
    });
  }

  history[history.length - 1] = {
    date: history[history.length - 1].date,
    price: flight.price,
  };

  return history;
};
