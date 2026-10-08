import { api } from "@/services/api/client";

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

  totalScore?: number;
  timeScore?: number;
  pickupScore?: number;
  destinationScore?: number;
};

export async function createRide(
  payload: CreateRidePayload
): Promise<Ride> {
  const { data } = await api.post<Ride>(
    "/api/rides",
    payload
  );

  return data;
}

export async function getAllRides(): Promise<Ride[]> {
  const { data } = await api.get<Ride[]>(
    "/api/rides"
  );

  return data;
}

export async function getMyRides(): Promise<Ride[]> {
  const { data } = await api.get<Ride[]>(
    "/api/rides/mine"
  );

  return data;
}

export async function getRide(
  rideId: number
): Promise<Ride> {
  const { data } = await api.get<Ride>(
    `/api/rides/${rideId}`
  );

  return data;
}

export async function findRides(
  payload: FindRidePayload
): Promise<Ride[]> {
  const { data } = await api.post<Ride[]>(
    "/api/rides/find",
    payload
  );

  return data;
}