# Accounts and Sessions

Prerequisite for multiple accounts ([#334](https://github.com/jocosocial/tricordarr/issues/334)). Reference implementation studied: Bluesky `social-app` (`src/state/session`). Notification identity (account in payloads and tags) and the native multi-socket Android service are described in [Notifications](Notifications.md); on iOS background notifications are active-account only, restarted on a switch.

## Model

Three records and one pointer (`src/Structs/SessionStructs.ts`):

- **Account**: who. Deduped on `(normalized serverUrl, userID)`. `accountID` is a stable uuid used in storage keys. `status` is `signedIn`, `signedOut` (token cleared, row kept) or `revoked` (the server rejected the token). `accessLevel` is refreshed from whoami, not the login-time snapshot.
- **ServerProfile**: which server. Keyed on normalized `serverUrl`; the per-server fields that used to live in AppConfig (cruise dates, time zone, sched URL, wifi names, canonical hostnames, ...), and whether the server is in pre-registration mode.
- **Session**: the active context. `(serverUrl, accountID | null)`. `accountID === null` is anonymous browsing. The query cache file and query keys hang off `sessionID`.
- `LAST_SESSION_ID_V1` is the single pointer background code reads.

`normalizeServerUrl` (`src/Libraries/ServerUrl.ts`) is the canonical form: scheme and host lowercased, no path, no trailing slash. Use it wherever a server URL becomes an identity.

## Store

`SessionStore` + `useSyncExternalStore`, reducer in `SessionState.ts`. The reducer is pure: ids and timestamps arrive on the action. Persistence runs inside `dispatch` (`SessionPersistence.ts`), chained so writes land in order, and writes only the keys that changed. `flushSessionWrites()` resolves when queued writes are done; `startPushProvider` awaits it so it never reads a stale `LAST_SESSION_ID`.

Stale-source guard: an action produced asynchronously (whoami, a 401) carries the `sourceSessionID` it was produced for, and the reducer ignores it if that session is no longer current. A late response from account A cannot touch A after the user switched to B.

Context API: `useSession()` (`SessionContext.ts`). Notable: `signIn(serverUrl, token, {boardFromSessionID})`, `signOut(accountID?)`, `switchToAccount`, `switchToServer(serverUrl, {preserveNavigation, boardFromSessionID})`, `removeAccount`, `removeSession`. `switchToAccount` returns `'needs-login'` for a signed-out or revoked account instead of switching; `useAccountSwitcher` turns that into the login form pre-filled with `username@server`. A pending switch blocks further switches.

## SessionBoundaryProvider

`SessionBoundaryProvider` remounts everything beneath it on every session change. Each mount of `SwiftarrQueryClientProvider` creates its own `QueryClient`, persister (`query-cache-<sessionID>`) and axios clients from that session's account token and server, so cached data cannot cross sessions. Sockets, filters, selection state and navigation reset with it. `queryKeyExtraData` (`[sessionID, serverUrl, userID]`) stays so cache reducers remain correct even if two clients ever shared a cache.

Above the scope (device-scoped): Config, Session, EffectiveConfig, Oobe, PreRegistration, Permissions, Theme, Navigation, Keyboard, Style, ErrorHandler, Snackbar. Below it everything that touches the API client, query cache or sockets. See [Navigation](Navigation.md) for the navigator consequences.

Because the scope unmounts, anything that must outlive the old session (releasing the iOS push provider) happens in `SessionProvider` before the dispatch, not in the scope.

## Flows

- **Login / Register**: take an explicit `serverUrl` (the route param, else the active session's), never `appConfig.serverUrl`. `POST /auth/login` on that server, site login for the webview cookie, then `signIn`, which reads whoami, upserts the account, finds or creates its session and switches. Logging in never signs anyone else out. Forgot Password/Username act on that same explicit server.
- **Switch**: release the old account's push provider (iOS; the Android service is keyed by account and is re-synced after the remount), dispatch, the scope remounts, `AccountCookieSync` puts that account's webview cookie back, `AccountIdentitySync` keeps the account row current, `EffectiveConfigProvider` re-mirrors config to native, the caller toasts "Signed in as username".
- **Sign out (this device)** clears the token and the account's cookie and cache, keeps the row, and switches to the next most recently used signed-in account, else the anonymous session for the server. **Sign out all devices** also calls `/auth/logout`. **Remove** deletes the account, token, cookie, preferences and sessions (with cache files).
- **Server change**: `switchToServer` finds or creates the anonymous session for the server.
- **Pre-registration mode** is a property of the server, so it lives on its `ServerProfile` and every session on that server agrees. `preRegistrationMode` is the server's own `enablePreregistration`, mirrored from `/client/settings` by `ClientSettingsProvider` whenever that data changes; for a server nothing is known about yet, `SessionProvider` assumes it from whether the URL is the pre-registration server. `preRegistrationOverride` is a local decision that wins over it: the developer toggle and the banner's hidden disable (`setPreRegistrationOverride`; setting it to what the server reports clears it). Read it with `usePreRegistration()` or `isServerPreRegistration(profile)`.
- **401 on a token route** (a request that carried this session's token, not a maintenance-mode 401): `account-revoked` for that account, guarded by `sessionID`, and a snackbar "Your session for username was signed out. Tap to sign in again."
- **OOBE** completion is device-level (`APP_OOBE_COMPLETED_VERSION_V1`).

## The setup flow

First-run setup, boarding and Add Account are one flow (`OobeStackNavigator`) in three modes (`OnboardingMode` in `src/Types/RouteParams.ts`):

- **firstRun**: Welcome, Location, Server, Account, *commit*, Session, Permissions, Finish.
- **boarding**: Welcome Aboard (long-press the pre-registration banner), Server (pre-filled with the default, production, server), Account, *commit*, Session, Permissions, Finish.
- **addAccount**: Server, Account, *commit*, Session (Done returns to the app).

The Session step (`OobeSessionScreen`) shows what the commit produced: the signed-in account (username, server, access level) or anonymous browsing on the server. It is the confirmation for every mode, so setup never shows the "Signed in as" toast. It offers no account changes; those are in Settings > Accounts. Paths that commit nothing because the session is already the chosen one (proceeding anonymously on the current server, confirming the account on a re-run, signing in again to the active account) push the same step.

When boarding, the Account step passes the pre-registration account's username to the login form as its initial username, since people forget the one they registered with. A user who boards with a pre-registration account is not offered Create Account (or the text leading up to it), and the Log In text tells them they already have an account. One who boards anonymously sees all three options.

At the Account step, Create Account goes through Conduct (`RegisterConductScreen`) before Register; Log In and Proceed Without an Account skip it. Register outside the setup flow (the Today account menu) goes through the same screen in the Settings stack, so every account creation agrees to the server's code of conduct first.

Two rules hold it together:

1. **Nothing before the commit touches the session.** The server, account, conduct and register steps take an explicit `serverUrl` param and read that server directly (`useExplicitServerHealthStatus`, `useExplicitServerConductQuery`, built on `useExplicitOpenQuery` / `useExplicitPublicQuery`: a bare request with no token, never persisted, and kept out of the session's disruption error count). First run has no session at all until the commit; `useOpenQuery` and friends stay disabled without one, so nothing fires at a default server. Backing out of boarding or Add Account at any step leaves the app exactly as it was.
2. **The commit is one call**, `useOnboardingCommit(mode)`: `commitSignIn` (from `LoginScreen`, or `RecoveryKeyScreen` after a registration) or `commitAnonymous` ("Proceed Without an Account"). It is a normal `signIn` / `switchToServer`, plus what the mode adds.

What the modes add:

- Every mode sets `OobeProvider.resumeMode` to itself. The commit remounts the navigators; the root navigator then starts in the setup stack, which starts at the Session step instead of Welcome and hands it the mode. The flag is cleared by `oobeFinish`, or by the Session step's Done in **addAccount**.
- **boarding** passes `boardFromSessionID`. In the same reduction that activates the new session, the reducer's `retireServer` deletes every account, session and the profile of the server being left, and persistence deletes their tokens, cookies, preferences and cache files. This is the cutoff: after it there is no pre-registration session to switch back to and the banner is gone. A sign-in seeds the new account's preferences from the pre-registration account's; proceeding without an account writes them to `DeviceConfig.defaultPreferences` instead, so the anonymous session uses them and a later sign-in starts from them. Both ways of committing cut off. Boarding onto the server being left (a developer toggling pre-registration on one server) retires nothing.

A registration shows its recovery key *before* signing in: `RegisterScreen` creates the user and gets a token, then hands both to `RecoveryKeyScreen` (`pendingSignIn`), and acknowledging the key commits. Signing in first would remount the navigators and the key would never be shown.

Forgot Password / Forgot Username take the login form's `serverUrl` the same way (`recoverAccountOnServer`, `lookupUsernameOnServer`), so they work at every login step, including boarding, where the active session is still the pre-registration one.

## Config

`AppConfig.ts` splits the old single blob three ways:

- **DeviceConfig** (`APP_CONFIG_V3`): urlPrefix, apiClientConfig, worker/socket flags, developer flags, accessibility, logLevel, timezone-warning flags, `enableLateDayFlip`, `serverUrl` (only "default server for a new session"), and `defaultPreferences`.
- **AccountPreferences** (`ACCOUNT_PREFS_V1_<accountID>`): push toggles, mute, `markReadCancelPush`, `userPreferences.*`, `schedule.*` (minus `enableLateDayFlip`), `dismissWelcomeAboard`, `backgroundNotifications` (Android: keep this account's notification socket while another account is active). A new account starts from `defaultPreferences`; with no account signed in, edits to preferences become the defaults.
- **ServerProfile**: the per-server fields above.

`useConfig().appConfig` is the merged view (`EffectiveConfigProvider`), so its ~100 consumers did not change; `updateAppConfig(fullConfig)` splits the write back to the right home. Headless code (workers, push managers, mark-as-read) calls `getEffectiveConfig(sessionID?)`, which resolves the same merge through `LAST_SESSION_ID`. The merged view is what `setAppConfig` mirrors to native.

## No migration

Storage from before the account model (`SESSIONS_DATA_V1`, `APP_CONFIG_V2`) is not read. A device that has only those keys loads an empty account model and default device config, so it runs setup like a fresh install. `loadSessionData` reads `SESSIONS_V2` and friends, or returns an empty model.

## UI

Settings > Accounts (`AccountsSettingsScreen`): accounts with avatar, `username`, server, status badge ("Signed out", "Signed out remotely"), a check on the current one, a menu for Sign Out / Remove; Add Account (the setup flow in `addAccount` mode). Long-pressing the avatar in the Today header (or Switch Account in its menu) opens the quick-switch sheet. `SessionDetailsScreen` is a developer screen.

## Tests

`__tests__/unit/TestSessionReducer.ts`: reducer transitions, stale-source guards, boarding (the cutoff and preference carry-over), persistence (including that removing an account deletes its token, preferences and cache file), and the config split/merge.

## Open questions (decisions taken)

- Preferences: `userPreferences.*` are all per-account (the Model section), including swipe orientation, scroll button and photo options that the draft proposed as device-wide. Moving individual fields to `DeviceConfig` is a local change in `pickAccountPreferences` / `splitAppConfig`.
- `preRegistrationMode` is on `ServerProfile`, not `Session` (it was on `Session` in the first draft).
- No cap on accounts.
- `backgroundNotifications` defaults to off.
