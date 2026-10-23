# ShareRide release workflow (PowerShell)

Follow this order. Do not delete the working copy until both remote pushes, deployed smoke tests, and a fresh clone have succeeded. Keep secrets in local environment files only.

## 1) Extract and install

Mobile:
```powershell
Expand-Archive .\ShareRide-Mobile.zip -DestinationPath M:\ShareRide-Mobile-Release
cd M:\ShareRide-Mobile-Release\ShareRide-Mobile
Copy-Item .env.example .env
# Edit .env and set EXPO_PUBLIC_API_URL
npm ci
npm run lint
npx tsc --noEmit
npx expo start --clear
```

Backend (in a separate terminal):
```powershell
Expand-Archive .\ShareRide-Backend.zip -DestinationPath M:\ShareRide-Backend-Release
cd M:\ShareRide-Backend-Release\ShareRide-Backend
# Set SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, SPRING_DATASOURCE_PASSWORD, JWT_SECRET, ORS_API_KEY
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

Use Java 21 and a reachable PostgreSQL database. Do not replace or delete a working hosted database.

## 2) Manual acceptance test
1. Sign in once as the ride owner and once as the passenger; open Profile / Welcome → Manage accounts and switch both ways.
2. As passenger, request a seat. Switch to the ride-owner account.
3. Accept a pending request; confirm seats decrease once and passenger booking shows ACCEPTED. Create another request and test Reject; confirm it shows REJECTED.
4. Confirm a non-owner cannot accept/reject the request.
5. Test map pickup/destination preview. For Android native maps, set GOOGLE_MAPS_API_KEY, enable Maps SDK for Android, restrict key to package com.shareride.mobile, then rebuild.
6. If a 500 error appears, copy its Reference/errorId and find it in backend logs. Do not consider Accept/Reject verified until it works against the target database.

## 3) Push each project to its own Git repository
Initialize each extracted project as its own repository (or clone the intended remote first and copy these files into it). Review `git status`, verify no `.env` or secrets are staged, then commit and push. Example after setting the correct remote and branch:
```powershell
git init
git add .
git status
git commit -m "Fix ride requests, account switching, and map preview"
git branch -M main
git remote add origin <REMOTE_URL>
git push -u origin main
```
Do this independently in the mobile and backend project directories. If those remotes already have history, clone them and copy changes into the clone instead of initializing over existing history.

## 4) Combine both repositories using Git subtree
Create an empty combined repository, clone it, then add each existing remote. Example (replace remote URLs and branch names):
```powershell
git clone <COMBINED_REMOTE_URL> ShareRide-Combined
cd ShareRide-Combined
git remote add mobile <MOBILE_REMOTE_URL>
git remote add backend <BACKEND_REMOTE_URL>
git fetch mobile
git fetch backend
git subtree add --prefix=mobile mobile main --squash
git subtree add --prefix=backend backend main --squash
git push origin main
```
If the combined repository already contains either folder, do not run `subtree add` blindly; first compare histories and use `git subtree pull` or resolve the folder conflict deliberately.

## 5) Deploy and verify
- Set backend secrets/database environment in the host dashboard.
- Configure the service root directory/build context to `backend` (or deploy from the combined repo using the host's supported monorepo settings).
- Deploy, inspect startup logs, then test login, create request, Accept/Reject, and `/api/routes` against the deployed API.
- Set mobile `EXPO_PUBLIC_API_URL` to the deployed backend URL. Rebuild/restart the app and repeat the manual acceptance test.

## 6) Clean/reclone last
Only after pushes, deployment, and smoke tests succeed: ensure the remotes contain the latest commits, keep one backup archive outside the folders to be removed, then clone the final combined repository into a new folder and repeat the test. Delete old local folders and old demo archives manually only after verifying the fresh clone. Never delete `.git` or working folders before confirming the remote commit hashes.

## Validation status for this archive
Source changes and archive contents were checked. Full mobile install/lint/typecheck and backend Maven tests could not be completed in the preparation environment because npm/Maven dependency downloads were unavailable. Run the commands above on your laptop with network access before pushing/deploying.
