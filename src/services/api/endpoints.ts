export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    ME: "/api/auth/me",
    PROFILE: "/api/auth/profile",
    PREFERENCES: "/api/auth/preferences",
    PASSWORD: "/api/auth/password",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
  },
  RIDES: {
    BASE: "/api/rides",
    MINE: "/api/rides/mine",
    FIND: "/api/rides/find",
    BY_ID: (id: number | string) => `/api/rides/${id}`,
    UPDATE_STATUS: (id: number | string) => `/api/rides/${id}/status`,
  },
  RIDE_REQUESTS: {
    BASE: "/api/ride-requests",
    MINE: "/api/ride-requests/mine",
    BY_RIDE: (rideId: number | string) => `/api/ride-requests/ride/${rideId}`,
    BY_ID: (requestId: number | string) => `/api/ride-requests/${requestId}`,
    CANCEL: (requestId: number | string) => `/api/ride-requests/${requestId}/cancel`,
  },
  ROUTES: {
    CALCULATE: "/api/routes",
  },
  NOTIFICATIONS: {
    BASE: "/api/notifications",
    UNREAD_COUNT: "/api/notifications/unread-count",
    MARK_READ: (id: number | string) => `/api/notifications/${id}/read`,
    READ_ALL: "/api/notifications/read-all",
  },
  RATINGS: {
    BASE: "/api/ratings",
    MINE: "/api/ratings/mine",
    BY_USER: (userId: number | string) => `/api/ratings/user/${userId}`,
    BY_RIDE: (rideId: number | string) => `/api/ratings/ride/${rideId}`,
  },
  PAYMENTS: {
    ESTIMATE: "/api/payments/estimate",
    HISTORY: "/api/payments/history",
    MARK_PAID: (paymentId: number | string) => `/api/payments/${paymentId}/mark-paid`,
  },
} as const;
