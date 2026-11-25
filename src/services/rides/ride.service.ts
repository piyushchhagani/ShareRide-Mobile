import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";

export type CreateRidePayload = {
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;

  destinationAddress: string;
  destinationLatitude: number;
  destinationLongitude: number;

  departureTime: string;
  availableSeats: number;

  vehicleType?: string;
  vehicleNumber?: string;
  pricePerSeat?: number;
};

export type FindRidePayload = {
  pickupLatitude: number;
  pickupLongitude: number;

  destinationLatitude: number;
  destinationLongitude: number;

  departureTime: string;
  seats: number;

  vehicleType?: string;
  sortBy?: "MATCH_SCORE" | "PRICE_ASC" | "DEPARTURE_ASC";
  page?: number;
  size?: number;
};

export type Ride = {
  id: number;

  driverId: number;
  driverName: string;

  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;

  destinationAddress: string;
  destinationLatitude: number;
  destinationLongitude: number;

  departureTime: string;

  availableSeats: number;

  vehicleType?: string;
  vehicleNumber?: string;
  pricePerSeat?: number | null;

  status: string;

  matchScore?: number;
  routeScore?: number;
  timeScore?: number;
  pickupScore?: number;
  destinationScore?: number;
  detourScore?: number;

  driverAverageRating?: number | null;
  driverTotalRatings?: number;
};

export async function createRide(
  payload: CreateRidePayload
): Promise<Ride> {
  const { data } = await api.post<Ride>(
    ENDPOINTS.RIDES.BASE,
    payload
  );

  return data;
}

export async function getAllRides(): Promise<Ride[]> {
  const { data } = await api.get<Ride[]>(
    ENDPOINTS.RIDES.BASE
  );

  return data;
}

export async function getMyRides(statuses?: string[]): Promise<Ride[]> {
  const params = statuses && statuses.length > 0 ? { status: statuses.join(",") } : undefined;
  const { data } = await api.get<Ride[]>(
    ENDPOINTS.RIDES.MINE,
    { params }
  );

  return data;
}

export async function getRide(
  rideId: number
): Promise<Ride> {
  const { data } = await api.get<Ride>(
    ENDPOINTS.RIDES.BY_ID(rideId)
  );

  return data;
}

export async function findRides(
  payload: FindRidePayload
): Promise<Ride[]> {
  const { data } = await api.post<Ride[]>(
    ENDPOINTS.RIDES.FIND,
    payload
  );

  return data;
}

export async function updateRideStatus(
  rideId: number,
  status: "ACTIVE" | "COMPLETED" | "CANCELLED"
): Promise<Ride> {
  const { data } = await api.patch<Ride>(
    ENDPOINTS.RIDES.UPDATE_STATUS(rideId),
    { status }
  );

  return data;
}