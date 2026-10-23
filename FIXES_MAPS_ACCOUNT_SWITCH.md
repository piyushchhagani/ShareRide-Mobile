# Maps and account-switch fixes

## Google Maps Android configuration
- Set `GOOGLE_MAPS_API_KEY` in the local environment or EAS build environment.
- The key is read by `app.config.js`; it is not embedded as a literal in source.
- `react-native-maps` config plugin and `android.config.googleMaps.apiKey` configure the native Android build.
- Enable **Maps SDK for Android** in Google Cloud, configure billing, and restrict the key to Android app package `com.shareride.mobile` plus the signing certificate SHA-1.
- After setting the key, run `npx expo prebuild --platform android` so the native config plugin is applied, then rebuild/reinstall the Android app. A JS refresh alone cannot update a native Maps API key.
- If the key is missing, the existing map component retains a coordinate fallback rather than crashing. Route fallback behavior remains unchanged.

## Switch Account
- Manage Accounts now has a confirmed “Switch account · Sign in with another account” action.
- Confirming calls the auth store logout, which deletes the active auth token and resets in-memory auth state, then dismisses navigation history and replaces the route with `/auth/login`.
- Saved account shortcuts remain available by design; their tokens are not deleted, so the existing saved-account switching flow is preserved.
- Login already saves the newly authenticated account and updates the auth store.

## Verification
- Automated checks should be run from the project root with `npm ci`, `npx expo config --type public`, `npm run lint`, and an Android build after providing the real API key.
- A valid Google Maps key and native Android rebuild are required to verify actual map tiles on a device.
