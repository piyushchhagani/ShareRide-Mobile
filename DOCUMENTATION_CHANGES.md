# ShareRide Mobile - Implementation & Audit Changes

This document details all structural, API integration, routing, cross-platform storage, and flow changes implemented in the mobile client repository.

---

## 1. Centralized API Endpoints
- **File**: `src/services/api/endpoints.ts`
  - Replaced hardcoded URL strings across service files with a centralized `ENDPOINTS` registry:
    - `AUTH`: `LOGIN`, `REGISTER`, `ME`
    - `RIDES`: `BASE`, `MINE`, `FIND`, `BY_ID(id)`, `UPDATE_STATUS(id)`
    - `RIDE_REQUESTS`: `BASE`, `MINE`, `BY_RIDE(rideId)`, `BY_ID(requestId)`
    - `ROUTES`: `CALCULATE`

---

## 2. API Service Layer Refactoring
- **Files**:
  - `src/services/rides/ride.service.ts`
  - `src/services/rides/request.service.ts`
  - `src/services/routes/route.service.ts`
  - `src/services/auth/auth.service.ts`
- **Changes**:
  - Switched all HTTP calls in `ride.service.ts`, `request.service.ts`, and `route.service.ts` to `ENDPOINTS`.
  - Added `updateRideStatus(rideId, status)` to `ride.service.ts` to allow drivers to complete or cancel rides.
  - Wrapped `register()` in `auth.service.ts` in robust try/catch with diagnostic logging.
  - Added JSDoc documenting the GeoJSON `[longitude, latitude]` coordinate order in `route.service.ts`.

---

## 3. Cross-Platform Storage Adapter
- **Files**:
  - `src/utils/storage.ts` (New)
  - `src/services/api/client.ts`
  - `src/services/auth/auth.service.ts`
- **Changes**:
  - Created `storage.ts` providing unified `getStorageItem`, `setStorageItem`, and `deleteStorageItem` functions.
  - On native Android/iOS, uses `expo-secure-store`.
  - On Web browsers, safely uses `window.localStorage` (preventing `ExpoSecureStore.deleteValueWithKeyAsync` missing function crashes on web).
  - Updated Axios request/response interceptors in `client.ts` and token management in `auth.service.ts` to use this cross-platform adapter.

---

## 4. UI & Form Error Handling
- **Files**:
  - `src/app/auth/login.tsx`
  - `src/app/auth/register.tsx`
- **Changes**:
  - Enhanced error handling to support both string-based backend responses and structured `{ message: "..." }` JSON responses.
  - Prevents generic "Unable to create account" fallback from masking actual backend messages (e.g. "Email already registered").

---

## 5. Map & Navigation Typing Fixes
- **Files**:
  - `src/components/maps/LocationMap.tsx`
  - `src/app/location.tsx`
- **Changes**:
  - Added type-only `import type { Region } from "react-native-maps";` to both files, resolving TypeScript compilation errors.
  - Verified `LocationMap.tsx` Polyline maps GeoJSON `[longitude, latitude]` pairs correctly to `{ latitude: coord[1], longitude: coord[0] }`.

---

## 6. App State Management
- **File**: `src/store/app.store.ts`
  - Replaced empty 0-byte file with a typed Zustand store managing `isInitialized` and `isOnline` states.

---

## 7. Android Build & Deployment Configuration
- **Files**:
  - `eas.json` (Configured `preview` profile with `buildType: "apk"` and `distribution: "internal"`)
  - `app.json` (Configured package `com.shareride.mobile` with `expo-router`, `expo-secure-store`, and `expo-location` plugins)

---

## 8. Verification
- TypeScript Check: `npx tsc --noEmit` -> 0 errors.
- End-to-end Web browser verification via automated browser subagent.
- Full passenger and driver flows tested against live Spring Boot backend.
