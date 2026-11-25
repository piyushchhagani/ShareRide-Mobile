import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";

export type RatingItem = {
  id: number;
  rideId: number;
  raterId: number;
  raterName: string;
  ratedUserId: number;
  ratedUserName: string;
  score: number;
  comment: string | null;
  createdAt: string;
};

export type UserRatingSummary = {
  userId: number;
  averageRating: number | null;
  totalRatings: number;
  totalCompletedRides: number;
  ratings: RatingItem[];
};

export async function createRating(payload: {
  rideId: number;
  ratedUserId: number;
  score: number;
  comment?: string;
}): Promise<RatingItem> {
  const { data } = await api.post<RatingItem>(ENDPOINTS.RATINGS.BASE, payload);
  return data;
}

export async function getMyRatings(): Promise<UserRatingSummary> {
  const { data } = await api.get<UserRatingSummary>(ENDPOINTS.RATINGS.MINE);
  return data;
}

export async function getUserRatings(userId: number): Promise<UserRatingSummary> {
  const { data } = await api.get<UserRatingSummary>(
    ENDPOINTS.RATINGS.BY_USER(userId)
  );
  return data;
}

export async function getRideRatings(rideId: number): Promise<RatingItem[]> {
  const { data } = await api.get<RatingItem[]>(
    ENDPOINTS.RATINGS.BY_RIDE(rideId)
  );
  return data;
}
