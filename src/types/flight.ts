export interface FlightLocation {
  city: string;
  code: string;
  time: string;
}

export interface FlightTicket {
  id: string;
  airline: string;
  flightNumber: string;
  isDirect: boolean;
  departure: FlightLocation;
  destination: FlightLocation;
  price: number;
  originalPrice: number;
  discountRate: number;
  lastUpdated: string;
  tags: string[];
}

export interface SubscriptionNotice {
  id: string;
  flightId: string;
  message: string;
  createdAt: number;
}
