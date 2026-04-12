import type { FlightTicket } from '@/types/flight';

export type FlightApiProvider = 'aerodatabox' | 'booking' | 'learning' | 'mock';

export interface FetchRealFlightsParams {
  fromId: string;
  toId: string;
  adults: number;
  children?: number;
  cabinClass: string;
  departDate: string;
  returnDate?: string;
  currency_code?: string;
  provider?: FlightApiProvider;
}

export interface FetchRealFlightsResult {
  flights: FlightTicket[];
  source: 'api' | 'cache' | 'mock';
  provider: FlightApiProvider;
  sourceLabel: string;
  message?: string;
  requireUserApi?: boolean;
}

export interface BookingUserApiConfig {
  apiKey: string;
  apiHost: string;
}

export function fetchRealFlights(
  params: FetchRealFlightsParams,
): Promise<FetchRealFlightsResult>;

export function getBookingUserApiConfig(): BookingUserApiConfig;

export function saveBookingUserApiConfig(config: BookingUserApiConfig): void;
