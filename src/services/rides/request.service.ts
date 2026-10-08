import { api } from "@/services/api/client";

export type RideRequest = {
  id: number;

  rideId: number;

  passengerId: number;

  passengerName: string;

  status: string;

  requestedSeats: number;

  createdAt: string;
};

export async function requestRide(
  rideId: number,
  seats: number = 1
): Promise<RideRequest> {
  const { data } = await api.post<RideRequest>(
    "/api/ride-requests",
    {
      rideId,
      seats,
    }
  );

  return data;
}

export async function getMyRequests(): Promise<RideRequest[]> {
  const { data } = await api.get<RideRequest[]>(
    "/api/ride-requests/mine"
  );

  return data;
}

export async function updateRideRequest(
  requestId: number,
  action: "ACCEPT" | "REJECT"
): Promise<RideRequest> {
  const { data } = await api.patch<RideRequest>(
    `/api/ride-requests/${requestId}`,
    {
      action,
    }
  );

  return data;
}