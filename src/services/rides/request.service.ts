import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";

export type RideRequest = {
  id: number;
  rideId: number;
  passengerId: number;
  passengerName: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  requestedSeats: number;
  createdAt: string;
  cancelledAt?: string | null;
  driverId?: number;
  driverName?: string;
  pickupAddress?: string;
  destinationAddress?: string;
  departureTime?: string;
  rideStatus?: string;
};

export type RideRequestAction = "ACCEPT" | "REJECT";

export async function requestRide(
  rideId: number,
  seats: number = 1
): Promise<RideRequest> {
  const { data } = await api.post<RideRequest>(
    ENDPOINTS.RIDE_REQUESTS.BASE,
    {
      rideId,
      seats,
    }
  );

  return data;
}

export async function getMyRequests(statuses?: string[]): Promise<RideRequest[]> {
  const params = statuses && statuses.length > 0 ? { status: statuses.join(",") } : undefined;
  const { data } = await api.get<RideRequest[]>(
    ENDPOINTS.RIDE_REQUESTS.MINE,
    { params }
  );

  return data;
}

export async function getRideRequests(
  rideId: number,
  status?: string
): Promise<RideRequest[]> {
  const params = status ? { status } : undefined;
  const { data } = await api.get<RideRequest[]>(
    ENDPOINTS.RIDE_REQUESTS.BY_RIDE(rideId),
    { params }
  );

  return data;
}

export async function updateRideRequest(
  requestId: number,
  action: RideRequestAction
): Promise<RideRequest> {
  const { data } = await api.patch<RideRequest>(
    ENDPOINTS.RIDE_REQUESTS.BY_ID(requestId),
    { action }
  );

  return data;
}

export async function cancelRideRequest(
  requestId: number
): Promise<RideRequest> {
  const { data } = await api.patch<RideRequest>(
    ENDPOINTS.RIDE_REQUESTS.CANCEL(requestId)
  );

  return data;
}
