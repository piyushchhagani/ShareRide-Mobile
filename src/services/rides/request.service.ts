import { api } from "@/services/api/client";

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
      "/api/ride-requests",
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
      "/api/ride-requests/mine"
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
      `/api/ride-requests/ride/${rideId}`
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
  console.log(
    "UPDATE RIDE REQUEST:",
    requestId,
    action
  );

  try {
    const { data } =
      await api.patch<RideRequest>(
        `/api/ride-requests/${requestId}`,
        {
          action,
        }
      );

    console.log(
      "UPDATE RIDE REQUEST SUCCESS:",
      data
    );

    return data;
  } catch (error: any) {
    console.log(
      "UPDATE RIDE REQUEST FAILED:",
      error?.response?.status
    );

    console.log(
      "UPDATE RIDE REQUEST ERROR:",
      error?.response?.data
    );

    console.log(
      "UPDATE RIDE REQUEST MESSAGE:",
      error?.message
    );

    throw error;
  }
}