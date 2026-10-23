import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";

export type RouteRequest = {
  pickupLatitude: number;
  pickupLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
};

/**
 * Route response from backend.
 *
 * NOTE ON COORDINATES:
 * Following GeoJSON standards (RFC 7946) and OpenRouteService, coordinates are
 * provided as [longitude, latitude] pairs in each inner array.
 * When passing to React Native Maps Polyline, map each coordinate to:
 * `{ latitude: coord[1], longitude: coord[0] }`.
 */
export type RouteResponse = {
  distanceMeters: number;
  durationSeconds: number;
  /** Array of [longitude, latitude] GeoJSON coordinate pairs */
  coordinates: [number, number][];
  /** True when road routing failed and the backend returned a straight-line estimate. */
  approximate?: boolean;
};

export async function calculateRoute(
  payload: RouteRequest
): Promise<RouteResponse> {
  const { data } =
    await api.post<RouteResponse>(
      ENDPOINTS.ROUTES.CALCULATE,
      payload
    );

  return data;
}
