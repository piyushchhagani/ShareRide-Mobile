# ShareRide Mobile

## Requirements
- Node.js 22 LTS recommended
- npm
- Android Studio/device for native map verification

## Setup (PowerShell)
```powershell
Copy-Item .env.example .env
# Edit .env and set EXPO_PUBLIC_API_URL to your backend URL
npm ci
npx expo start --clear
```

Create `.env.example` with a non-secret API URL placeholder only. Never commit `.env`.

## Android Maps
Set `GOOGLE_MAPS_API_KEY` in the environment before a native build. Enable Maps SDK for Android and restrict the key to package `com.shareride.mobile`. Rebuild after changing the key. Without it, the app shows an explanatory map preview instead of an empty tile area.

## Account switching
Sign in with each account once. Open **Profile → Manage accounts** (also available from Welcome/Login) to switch. Passwords are not stored; each account's session token is kept in platform secure storage. Expired sessions must be re-authenticated.

## Checks
```powershell
npm ci
npm run lint
npx tsc --noEmit
```

Then test both accounts and Accept/Reject against the deployed or local backend.
