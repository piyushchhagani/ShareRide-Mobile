import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";

export type RideRequest = {
  id: number;

  rideId: number;

  passengerId: number;

  passengerName: string;

  status: "PENDING" | "ACCEPTED" | "REJECTED";

  requestedSeats: number;

  createdAt: string;
};

export type RideRequestAction =
  | "ACCEPT"
  | "REJECT";

/**
 * Passenger requests a ride.
 */
export async function requestRide(
  rideId: number,
  seats: number = 1
): Promise<RideRequest> {
  const { data } =
    await api.post<RideRequest>(
      ENDPOINTS.RIDE_REQUESTS.BASE,
      {
        rideId,
        seats,
      }
    );

  return data;
}

/**
 * Passenger gets their own ride requests/bookings.
 */
export async function getMyRequests(): Promise<
  RideRequest[]
> {
  const { data } =
    await api.get<RideRequest[]>(
      ENDPOINTS.RIDE_REQUESTS.MINE
    );

  return data;
}

/**
 * Driver gets pending requests
 * for a particular ride.
 */
export async function getRideRequests(
  rideId: number
): Promise<RideRequest[]> {
  const { data } =
    await api.get<RideRequest[]>(
      ENDPOINTS.RIDE_REQUESTS.BY_RIDE(rideId)
    );

  return data;
}

/**
 * Driver accepts or rejects a passenger request.
 */
export async function updateRideRequest(
  requestId: number,
  action: RideRequestAction
): Promise<RideRequest> {
  const { data } =
    await api.patch<RideRequest>(
      ENDPOINTS.RIDE_REQUESTS.BY_ID(requestId),
      {
        action,
      }
    );

  return data;
}