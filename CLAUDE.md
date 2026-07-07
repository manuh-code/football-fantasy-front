# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server on http://localhost:5174
npm run build     # Production build to dist/ (Vite 8 / rolldown)
npm run preview   # Serve the built dist/ on http://localhost:8080
npm run lint      # ESLint (--fix) over .vue/.ts/.js
```

- **No test runner is configured.** The README mentions Jest/Cypress but they are not installed and there are no test files. Do not assume `npm test` exists.
- **`build` does not typecheck.** `vite build` transpiles without `vue-tsc`, so type errors do not fail the build. Rely on the IDE/`tsc` for type safety; `strict: true` is on in `tsconfig.json`.
- Node 22 (see Dockerfile). Dependencies were installed with `npm install --legacy-peer-deps`.

## Architecture

Vue 3 (Composition API, `<script setup>`) + TypeScript + Vite. State via Pinia, i18n via vue-i18n, styling via TailwindCSS 3 + SCSS. Path alias `@/` → `src/`.

The app is organized by **feature domain** — the same domain names recur across `views/`, `components/`, `services/`, `store/`, and `interfaces/`: **fantasy** (leagues, draft, teams), **football** (leagues, teams, players, fixtures), **pool** (quinielas), **survivor**, **user/auth**, plus `dashboard`, `home`, `landing`, `legal`.

### API / service layer — the core pattern

All HTTP goes through `useApiFantasy()` in [src/composables/useApiFantasy.ts](src/composables/useApiFantasy.ts), which builds one preconfigured axios instance:
- `baseURL` from `VITE_API_BASE_URL`. **Never use optional chaining on `import.meta.env`** (e.g. `import.meta?.env?.X`) — it breaks Vite's static env replacement in production builds.
- Request interceptor injects `Authorization: Bearer <token>` from the auth store, `Accept-Language` from the locale store, and a `TimeZone` header.
- Response interceptor centralizes error handling: shows a toast, and on **401** clears auth + redirects to login, on **422** pushes field errors into the validation store. Set `config._silent = true` on a request to suppress its error toast.

Services live in `src/services/<domain>/*Service.ts` as classes whose constructor calls `useApiFantasy()`. The backend wraps every response as `ApiResponse<T>` (`{ code, data, ... }`); service methods check `response.data.code === 200`, return `response.data.data`, and otherwise `throw new AxiosError(...)`.

**Instantiation is deliberately split to avoid a circular-import crash** (router → service → `useApiFantasy` → imports router):
- Most services export an eager singleton (`export default new XService()`).
- Auth-critical ones use a lazy factory (e.g. `getLoginService()` in [LoginService.ts](src/services/login/LoginService.ts)) so `import.meta.env` and the router are ready first.
- The router **dynamically imports** `CatalogService` inside the guard rather than at the top level — see the comment in [src/router/index.ts](src/router/index.ts). Preserve these patterns when adding services touched during startup/navigation.

### Routing & the two gates

[src/router/index.ts](src/router/index.ts) uses lazy-loaded route components and a single `beforeEach` guard that enforces two things:
1. **Auth gate** — routes with `meta.requiresAuth` redirect unauthenticated users to `login` (with a `redirect` query). Auth state comes from `useAuthStore().isAuthenticated()`, which validates the token against the API with a 5-minute cache (see `LoginService`).
2. **League gate** — a football league must be selected to use the app. For everyone (anonymous included) the guard auto-selects the default league (the first the API returns, i.e. Liga MX) so nobody is forced through the selection screen. Routes in `LEAGUE_EXEMPT_ROUTES` skip this. Only if the default can't be resolved does it redirect to `footballLeagues`.

The guard also sets `document.title` / meta description from route `meta`.

### State (Pinia)

Stores in `src/store/<domain>/`. Persistence uses `pinia-plugin-persistedstate` with an explicit `pick` (e.g. auth persists only `token`, locale only `locale`). Stores frequently call other stores and services from within actions (e.g. `authStore.login` populates the user store and claims push tokens).

### i18n

vue-i18n in Composition mode (`legacy: false`), **default `es`, fallback `en`**. Translations are modular: one JSON per domain under `src/locales/{es,en}/<domain>.json`, aggregated into namespaces in [src/i18n/messages.ts](src/i18n/messages.ts) (key path is `<domain>.<...>`, e.g. `auth.login.title`). **When adding keys, add them to both `es` and `en`; a new domain file must also be imported and registered in `messages.ts`.** Use `t()` exported from `@/i18n` to translate outside component setup (interceptors, composables); `setI18nLocale()` is the single place that mutates the active locale. Legal pages are intentionally Spanish-only (Mexican LFPDPPP compliance).

### Real-time (Ably) & the draft

Realtime uses Ably ([src/broadcast/ably.ts](src/broadcast/ably.ts), `echo.ts`) wrapped by `useAblyClient`/`useAblyChannel`/`useAblyBroadcast` in `src/composables/broadcast/`. The **fantasy draft** is the main realtime feature: `useDraft` + `useDraftChannel` + `useDraftTimer` coordinate live turn changes, player picks, presence (who's online), and a per-turn countdown over an Ably channel per league.

### Push notifications & PWA

Firebase Cloud Messaging is configured in [src/firebase/config.ts](src/firebase/config.ts); `usePushNotifications` claims/unregisters FCM tokens on login/logout. The app is an installable PWA via `vite-plugin-pwa` (`registerType: 'prompt'`); `usePwaInstall`/`usePwaUpdate` drive the install and update prompts.

### Ads (policy-sensitive)

Google AdSense config in [src/config/ads.ts](src/config/ads.ts). **Do not enable AdSense "Auto ads"** — only manual `<AdUnit>` components placed inside content-rich screens are allowed. A slot whose id still starts with `[` is intentionally disabled and renders nothing (safe to ship before real ids exist).

## Environment variables

All client vars are prefixed `VITE_`. See `.env.example`:
- `VITE_API_BASE_URL` — backend API base (e.g. `http://localhost:8084/api/`).
- `VITE_ABLY_KEY`, `VITE_ABLY_CLUSTER` — Ably realtime. (Note: `src/broadcast/ably.ts` and `echo.ts` are unused legacy files; the live path is the `useAbly*` composables, which read `VITE_ABLY_KEY`.)
- `VITE_FIREBASE_*` (API key, auth domain, project id, storage bucket, messaging sender id, app id, VAPID key).
- `VITE_APP_TITLE`, `VITE_APP_NAME`, `VITE_APP_SHORT_NAME`.

## Deployment

Push to `main` triggers [.github/workflows/deploy.yml](.github/workflows/deploy.yml): it builds the multi-stage `Dockerfile` (`production` target = nginx serving `dist/`), pushes the image to Docker Hub, and deploys to the VPS (production: fantasymx.cloud). `VITE_*` values are passed as Docker **build args** — a new env var must be added to both the workflow and the `Dockerfile` `ARG`/`ENV` list to reach the production build. Active development happens on `develop`.
