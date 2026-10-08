import { api } from "@/services/api/client";

export type RouteRequest = {
  pickupLatitude: number;
  pickupLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
};

export type RouteResponse = {
  distanceMeters: number;
  durationSeconds: number;
  coordinates: number[][];
};

export async function calculateRoute(
  payload: RouteRequest
): Promise<RouteResponse> {
  const { data } =
    await api.post<RouteResponse>(
      "/api/routes",
      payload
    );

  return data;
}