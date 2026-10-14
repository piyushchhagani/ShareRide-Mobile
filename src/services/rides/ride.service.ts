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
};

export type FindRidePayload = {
  pickupLatitude: number;
  pickupLongitude: number;

  destinationLatitude: number;
  destinationLongitude: number;

  departureTime: string;
  seats: number;
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

  status: string;

  matchScore?: number;
  routeScore?: number;
  timeScore?: number;
  pickupScore?: number;
  destinationScore?: number;
  detourScore?: number;
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

export async function getMyRides(): Promise<Ride[]> {
  const { data } = await api.get<Ride[]>(
    ENDPOINTS.RIDES.MINE
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