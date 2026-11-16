# Notifications

Push notifications on a ship with no FCM/APNs: a socket to the Swiftarr server stays open in the
background and turns events into local notifications.

## Android: native foreground service

`android/app/src/main/java/com/tricordarr/push/`. Replaces the old JS worker that ran inside
notify-kit's foreground service. It runs with no React context, so notifications keep arriving
after the app is swiped away or the device reboots.

| Piece                                         | Role                                                                                                                                                                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `TwitarrPushService`                          | Foreground service (`specialUse`). One `AccountConnection` per enabled account. Reconciles with the store every 30s, reconnects on `onAvailable`.                                                                                          |
| `AccountConnection`                           | OkHttp 4.9.2 WebSocket to `<server><urlPrefix>/notification/socket`, 30s ping (detects half-open sockets), 1s to 30s jittered backoff. A 401 on the handshake means the token was revoked: status becomes `Revoked` and it stops retrying. |
| `PushAccountStore`                            | Accounts and tokens, encrypted with an app-owned AndroidKeyStore AES-GCM key. JS replaces the list with `syncPushAccounts`; native never reads expo-secure-store.                                                                          |
| `NotificationPlanner` / `NotificationBuilder` | Port of the old `generatePushNotificationFromEvent` / `generateContentNotification`. The planner is Android-free and unit tested.                                                                                                          |
| `MarkAsReadReceiver`                          | The "Mark as Read" action: cancels the notification, calls the endpoint with the account's token, emits `onMarkAsRead` so JS refreshes caches.                                                                                             |
| `PushBootReceiver`                            | Restarts the service on `BOOT_COMPLETED` and `MY_PACKAGE_REPLACED` (not `LOCKED_BOOT_COMPLETED`: Keystore needs first unlock).                                                                                                             |
| `PushStatusStore`                             | Per-account health (`state`, last healthcheck, `failedCount`, `startedAt`). Native is the source of truth; JS pulls `getWebsocketStatus()`.                                                                                                |

Ten consecutive failures post a "Twitarr Connection Lost" notification; the service keeps retrying.
Foreground starts that Android refuses (API 31+, from the background) post "tap to reconnect".
The service notification is not `ongoing`, so on Android 14+ users can dismiss it and the service
keeps running; it is never re-posted.

### JS contract

`specs/NativeTricordarrModule.ts`: `syncPushAccounts`, `setPushAccountEnabled`,
`startBackgroundService`, `stopBackgroundService`, `getWebsocketStatus` (array, one entry per
account), `cancelContentNotification`, `cancelSecondaryNotifications`, and the events
`onNotificationSocketEvent`, `onBackgroundStatusChanged`, `onMarkAsRead` (Android only).

- `accountID` is the `Account.accountID` from the account model (see
  [Accounts and Sessions](Accounts%20and%20Sessions.md)). Native treats it as an opaque string.
- The JS in-app notification socket (`SocketProvider`) still runs while the app is foregrounded, for
  the active account's cache invalidation. The native service posts the notifications.

### Accounts

Both platforms: one background provider per device, one socket per account inside it. The provider
is device-wide, not part of a session: it is not torn down when the session changes.

- **Which accounts** (`selectPushAccounts` in `Push/PushAccounts.ts`): the active account, plus any
  other signed-in account whose `backgroundNotifications` preference is on (Settings > Background
  Connection > "Notify When Not Active", on by default; turning it off saves the battery and
  server load of one more socket). Never an account that is signed out, revoked, or on a server in pre-registration
  mode, and none at all before setup is complete or with the background worker switched off.
  Each account is filtered with its own push preferences and mute time.
- **Syncing**: `startPushProvider()` (`Push/index.ts`) is a reconcile, the same on both platforms.
  It reads the account model from storage, hands native the full list through `syncPushAccounts`,
  and starts the provider, or stops it when the list is empty. `PushNotificationService` calls it
  on launch, on every session change (it remounts with the session), and when the account list, a
  token, a push preference or the Wi-Fi networks change. Native reopens only the sockets whose
  server or token changed. `stopPushProvider()` stops every account. `SessionProvider` does not
  touch the provider on a switch.
- **Identity**: content IDs are only unique within an account, so each notification is scoped to
  its account (Android tag `acct:<accountID>`; iOS identifier `<accountID>:<contentID>` and thread
  `accountID`) and shows the username (Android sub text, iOS subtitle) when more than one account
  is connected. On Android "Connection lost" is one notification per account and the service
  notification lists the connected usernames.
- **Taps**: the deep link carries `?account=<accountID>`. `NavigationProvider`'s linking filter
  drops a link for an account that is not the active one, and `AccountLinkHandler` switches to that
  account (`useAccountSwitcher`, so a signed-out account gets the login form) and opens the link
  once the new session has mounted. The marker is stripped before routing, so it never becomes a
  route param. Helpers are in `Libraries/Notifications/AccountLink.ts`.
- **Mark as Read** (Android) runs natively with the token of the notification's account.
  `onMarkAsRead` carries the `accountID` and JS syncs caches only if that account is active.
- **Dismissing**: `cancelContentNotification` / `cancelSecondaryNotifications` in `Content.ts` go
  through native on both platforms, for the active account.
- **Status**: `getWebsocketStatus()` has one entry per connected account. The header indicator
  (`useBackgroundConnectionStatus`) shows the active account's; the settings screen lists them all.
- **Log**: entries carry the `accountID` of the socket that delivered them. The log screen labels
  another account's events and does not open them.
- **Revoked** (Android): a rejected token marks that account's socket `Revoked` natively and stops retrying.
  JS marks the account revoked when it next uses that token; an inactive account stays `signedIn`
  in the account model until then.

### Shared event table

`specs/NotificationEvents.json` is the one source for event type to channel, title, tap URL, and
mark-as-read path, plus the channel and group definitions. TS imports it
(`NotificationEventTitles.ts`); Kotlin bundles it as an asset (`copyNotificationEvents` in
`android/app/build.gradle`). `__tests__/unit/TestNotificationEvents.ts` checks it against the TS
enum, `Channels.ts`, and `RouteDefinitions`; `NotificationPlannerTest` checks the Kotlin side.

Swift (`WebsocketNotifier.swift`) still has its own copy of the table and does not read the JSON yet
(that needs the file added to the Xcode project as a bundled resource). Edit both when adding a type.

Do not change channel IDs or group membership: group binding is immutable and a new ID loses user
customizations. Add a new event by adding it to the JSON, `NotificationTypeData`, `AppConfig`
`pushNotifications`, and `contentNotificationCategories`.

### Foreground service type

`remoteMessaging`, the type the app already declares to Play, so no new declaration is needed. It
has no time cap and is not on the Android 15 boot-restart blocklist. `specialUse` (subtype
"persistent local-network notification socket; no FCM available at sea") is the more literal fit
but needs a fresh Play declaration. notify-kit's own `ForegroundService` stays `remoteMessaging` and
is only used by the call foreground service (`CallForegroundService.ts`), so the two no longer collide.

### Testing

- `cd android && ./gradlew :app:testDebugUnitTest` for the Kotlin unit tests.
- Device matrix (not automatable): foreground, background, swiped away, reboot, Doze, battery
  optimization on/off, airplane mode toggle, server `auth/logout` (expect `Revoked`), tap with the
  process dead but the task in recents, Mark as Read from the shade.
- Android 17 (`targetSdk` 37) adds `ACCESS_LOCAL_NETWORK`; needed if the ship server resolves to a
  private address. Not yet declared because `targetSdk` is 36.

## iOS

One provider, a socket per account, same contract as Android (see "Accounts" above).

| Piece                            | Role                                                                                                                                                                                           |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WebsocketNotifierGroup`         | The provider: one `WebsocketNotifier` per account, started, stopped and health-checked together. The local push extension runs one; the app runs another for when the extension is not active. |
| `WebsocketNotifier`              | One account's socket. Filters with that account's preferences, posts the notification, records the log entry, and persists its status per account in the App Group defaults.                   |
| `PushAccountConfig`              | Swift mirror of the JS `PushAccount`. The same dictionaries are stored in the `NEAppPushManager` provider configuration under `accounts`, which is how the extension gets them.                |
| `Notifications.syncPushAccounts` | Entry point from JS. Feeds the in-app group, saves the manager, and arbitrates between extension and in-app as before. An empty list disables the manager and stops everything.                |

- The extension only runs on the manager's `matchSSIDs`, which is the union of the synced accounts'
  `wifiNetworkNames` (each from its own server's profile). On a network only one server is on, the
  other accounts' sockets fail and retry on the healthcheck timer.
- The extension reads its accounts in `start()`. A changed provider configuration is expected to
  restart it; that has not been re-verified on a device since this became multi-account.
- A tap opens `tricordarr://<path>?account=<accountID>` (`Notifications.handleNotificationDeepLink`),
  which JS handles the same way as on Android.
- There is no Mark as Read action and no `Revoked` state on iOS. A rejected token keeps retrying on
  the healthcheck timer until JS stops syncing the account.
- `setupLocalPushManager` / `clearLocalPushManager` are gone; `syncPushAccounts` replaced them.

## notify-kit

Still used on iOS (`getInitialNotification`, `onForegroundEvent`), for channel creation, the developer test screen, and the Android call foreground service. Its
Android autolinking cannot be excluded until calls leave its service.
