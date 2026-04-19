# EvacuAid Mobile (Expo)

EvacuAid is a crisis coordination and evacuation support mobile app built with Expo + React Native.
It provides role-based operations, live incident/task/device synchronization, indoor map routing, and AI-assisted guidance.

## 1) Project Overview

This repository contains the mobile client for EvacuAid.

Core goals:

- Give responders and operations teams a single incident dashboard.
- Guide people to safety through map-based route computation.
- Keep incident, task, notification, and device state synchronized with backend APIs.
- Provide AI command assistance for quick situational guidance.

## 2) Tech Stack

- Framework: Expo SDK 54 + React Native 0.81
- Language: TypeScript
- Navigation: Expo Router
- State: Zustand
- Persistence: Zustand persist + AsyncStorage
- UI helpers: react-native-gesture-handler, @gorhom/bottom-sheet, lucide-react-native, react-native-svg
- Backend integration: HTTP APIs consumed through centralized API client
- Build system: EAS Build (APK/AAB)

## 3) High-Level Architecture

The app uses a layered architecture:

1. Presentation Layer

- Screens in `app/`
- Reusable UI components in `components/`

2. Domain/State Layer

- Global operational state in `data/store.ts`
- Navigation/map editor specific state in `stores/`

3. Integration Layer

- API transport and endpoint wrappers in `services/`

4. Computational Layer

- Graph + pathfinding algorithms in `lib/graph/`

5. Shared Contracts

- Core types/interfaces in `types/index.ts`

### Data Flow

UI Screen -> Zustand Action -> services/appApi.ts -> services/apiClient.ts -> Backend API

On successful response:

- Store state is updated and UI re-renders.

On failure:

- Optimistic updates are rolled back where needed.
- Errors are surfaced to UI (alerts, sync status, etc.).

## 4) Important Folders

- `app/`
  - Route-driven screens (tabs, assistant, report, emergency, etc.)
- `components/`
  - Shared UI components and map UI components
- `data/`
  - Main app store and mock seed data
- `services/`
  - API client/config and endpoint wrappers
- `stores/`
  - Specialized map editor and navigation stores
- `lib/graph/`
  - Building graph model + Dijkstra/A\* routing
- `types/`
  - Shared app types
- `assets/`
  - Fonts and images

## 5) Core Runtime Workflows

### A) App Startup + Hydration

1. Root layout mounts and triggers `initializeData()`.
2. Persisted role is rehydrated from local storage.
3. Store fetches remote shared state and devices with retry.
4. Screen tabs render according to role (Guest/Patient/Staff).

### B) Incident/Task/Notification/Device Sync

- Read:
  - `GET /api/state`, `GET /api/devices`
- Write:
  - Incidents: create + status patch
  - Tasks: create + status patch
  - Notifications: create + read/ack patches
  - Devices: status patch

Pattern used:

- Optimistic local update first
- API call second
- Rollback on failure

### C) Role-Based UX

- Roles: `Guest`, `Patient`, `Staff`
- Staff-only tab visibility for operational screens such as notifications/tasks/devices.

### D) Map + Routing Workflow

1. `editorStore` hydrates building map from remote map API.
2. User selects source/destination nodes and options.
3. `navigationStore` computes route using A\* or Dijkstra.
4. Routing can avoid emergency/danger nodes.
5. Updated map can be persisted back to backend.

### E) AI Assistant Workflow

1. User sends prompt from `app/assistant.tsx`.
2. Chat history is sent to `/api/chat` via `sendAiChat()`.
3. Response is appended to conversation UI.
4. Errors are shown with actionable messages.

## 6) Environment Configuration

Create `.env` in project root:

```env
EXPO_PUBLIC_EVACUAID_API_BASE_URL="https://your-backend-domain"
GEMINI_API_KEY="your-gemini-key-if-required-by-your-backend-flow"
DATABASE_URL="only-if-used-by-local-tools"
```

Notes:

- Mobile release builds must receive `EXPO_PUBLIC_...` values at build time.
- Local `.env` is not automatically used by EAS cloud builds unless configured in EAS env.

## 7) Local Development Commands

Install dependencies:

```bash
npm install
```

Start Metro (LAN + clear cache):

```bash
npm start
```

Start Android target:

```bash
npm run android
```

Start iOS target:

```bash
npm run ios
```

Start web target:

```bash
npm run web
```

## 8) APK / AAB Build Commands (EAS)

### One-time setup

```bash
npm install -g eas-cli@latest
eas login
eas whoami
```

### Ensure EAS env variable exists

```bash
eas env:create --scope project --name EXPO_PUBLIC_EVACUAID_API_BASE_URL --value https://your-backend-domain
eas env:list
```

### Build internal APK (preview)

```bash
eas build -p android --profile preview --clear-cache
```

### Build production Play Store bundle (AAB)

```bash
eas build -p android --profile production --clear-cache
```

### Install latest built binary on connected Android device

```bash
eas build:run -p android
```

## 9) API Integration Surface

Current API wrappers are centralized in `services/appApi.ts`:

- `/api/state`
- `/api/incidents`
- `/api/incidents/:id/status`
- `/api/tasks`
- `/api/tasks/:id/status`
- `/api/notifications`
- `/api/notifications/:id/read`
- `/api/notifications/:id/ack`
- `/api/devices`
- `/api/devices/:id/status`
- `/api/map`
- `/api/chat`

Transport behavior is handled in `services/apiClient.ts`:

- Base URL validation
- Android localhost/10.0.2.2 candidate fallback behavior
- HTTP status/error normalization

## 10) Operational Troubleshooting

### "API base URL is not configured" in APK

- Verify `EXPO_PUBLIC_EVACUAID_API_BASE_URL` is set in EAS project env.
- Rebuild APK with `--clear-cache`.
- Reinstall the newly built APK (old APK keeps old config).

### Data not loading

- Check backend is reachable from device network.
- Check API base URL has no trailing slash issues.
- Inspect sync error state in app store logs.

### Emulator localhost issues

- Prefer deployed backend URL in release builds.
- For local emulator testing, `10.0.2.2` may be required depending on setup.

## 11) Current Script List

From `package.json`:

- `start`
- `android`
- `ios`
- `web`

If you want linting, add an ESLint config and a `lint` script.

## 12) Security Guidance

- Never commit real secrets into Git.
- Rotate exposed API keys immediately if they were shared or committed.
- Keep production secrets in EAS environment variables and server-side secret stores.

## 13) Suggested Next Improvements

- Add ESLint + Prettier + lint script.
- Add basic unit tests around stores and API adapters.
- Add CI workflow for typecheck/build sanity.
- Add explicit environment matrix documentation (dev/staging/prod).
