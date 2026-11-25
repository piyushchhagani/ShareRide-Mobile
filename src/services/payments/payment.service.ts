import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";

export type PaymentItem = {
  id: number;
  rideRequestId: number;
  rideId: number;
  pickupAddress: string;
  destinationAddress: string;
  passengerId: number;
  passengerName: string;
  driverId: number;
  driverName: string;
  seats: number;
  amount: number;
  status: "UNPAID" | "PAID" | "CANCELLED";
  roleForViewer: "PASSENGER" | "DRIVER";
  paidAt: string | null;
  createdAt: string;
};

export async function estimateFare(params: {
  pickupLat: number;
  pickupLon: number;
  destLat: number;
  destLon: number;
}): Promise<{ suggestedPricePerSeat: number; currency: string }> {
  const { data } = await api.get<{
    suggestedPricePerSeat: number;
    currency: string;
  }>(ENDPOINTS.PAYMENTS.ESTIMATE, { params });
  return data;
}

export async function getPaymentHistory(): Promise<PaymentItem[]> {
  const { data } = await api.get<PaymentItem[]>(ENDPOINTS.PAYMENTS.HISTORY);
  return data;
}

export async function markPaymentPaid(paymentId: number): Promise<PaymentItem> {
  const { data } = await api.patch<PaymentItem>(
    ENDPOINTS.PAYMENTS.MARK_PAID(paymentId)
  );
  return data;
}
