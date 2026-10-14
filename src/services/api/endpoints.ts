export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    ME: "/api/auth/me",
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
  },
  ROUTES: {
    CALCULATE: "/api/routes",
  },
} as const;