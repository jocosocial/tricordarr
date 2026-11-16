# Notifications

Push notifications on a ship with no FCM/APNs: a socket to the Swiftarr server stays open in the
background and turns events into local notifications.

## Android: native foreground service

`android/app/src/main/java/com/tricordarr/push/`. It runs with no React context, so notifications keep arriving
after the app is swiped away or the device reboots.

| Piece                                         | Role                                                                                                                                                                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `TwitarrPushService`                          | Foreground service (`remoteMessaging`). One `AccountConnection` per enabled account. Reconciles with the store every 30s, reconnects on `onAvailable`.                                                                                     |
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
but needs a fresh Play declaration.

`CallService` (the in-call notification) declares `microphone|remoteMessaging`. `microphone` is what keeps
`AudioRecord` capturing when the app is backgrounded (Android 11+ silences it otherwise). It needs
`FOREGROUND_SERVICE_MICROPHONE`, `RECORD_AUDIO` granted when the service starts, and its own Play Console
foreground-service declaration. `phoneCall` is not an option: it requires the Telecom framework.

### Testing

- `cd android && ./gradlew :app:testDebugUnitTest` for the Kotlin unit tests.
- Device matrix (not automatable): foreground, background, swiped away, reboot, Doze, battery
  optimization on/off, airplane mode toggle, server `auth/logout` (expect `Revoked`), tap with the
  process dead but the task in recents, Mark as Read from the shade.

### Before raising `targetSdk` to 37

Android 17 adds the `ACCESS_LOCAL_NETWORK` runtime permission for apps that target it. It is deliberately
not declared today because `targetSdk` is 36, so raising the target is a blocker until it is handled:

- The Twitarr server lives on the ship's network, so every request and the notification socket are
  local-network traffic whenever the server resolves to a private address.
- Without the grant, the worker's connections would fail the same way an unreachable server does, and
  the failures would count toward giving up. A boot-started service has no UI to ask from.
- Declare the permission, request it from the app while it is visible (ahead of starting the worker),
  and treat a denial as its own state in Background Connection settings rather than as a connection
  failure.
- Confirm the exact behavior (which hosts count as local, and whether a hostname that resolves to a
  private address is covered) against the Android 17 docs when doing the bump; this note was written
  before that was tested.

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

### Giving up

A port call takes the user out of reach of the ship's server, so the worker does not retry forever. An
account that fails 10 times in a row with no successful connection between them
(`HealthTracker.DEFAULT_GIVE_UP_AFTER_FAILURES`) stops retrying and its state becomes `Stopped`. With the
reconnect backoff (1s doubling to 30s) that is about 2.5 to 3 minutes, but the limit is the count, not
the time. Its "connection lost" notification says to open the app. When every account has given up or is
revoked, the service stops itself. Opening the app (`startBackgroundService`) restarts accounts that gave up.
Rejoining Wi-Fi does not, because the network callback only wakes connections that are still retrying.

### After the cruise

A boot or app-update restart nobody asked for must not run forever. JS puts `autoStartUntil` on each
synced account (`selectPushAccounts`): the end of its server's cruise (start day plus length, in the
port timezone, from the mirrored `ServerProfile`), or nothing if the dates are not known yet or the
device-wide `keepRunningAfterCruise` setting is on (Background Connection settings). `PushBootReceiver` calls
`PushServiceController.startOnBoot`, which skips the start when no enabled account may auto-start. Opening
the app still starts the worker (`startBackgroundService`), and a worker that is already running is not
stopped.

## Android: call foreground service

`CallService` keeps the process alive, with an ongoing notification, while a KrakenTalk call is active.
`CallProvider` calls `showCallForegroundNotification` when the call becomes active (and again when mute
changes) and `dismissCallForegroundNotification` when it ends; both go through
`NativeTricordarrModule.showCallNotification` / `dismissCallNotification` to `CallServiceController`.
The system counts the call duration from the start time, so nothing updates it each second. A tap opens
the app (the call UI is an overlay). The module methods are no-ops on iOS, where CallKit presents the call.

## No notification library

There is no JS notification library. Android posts and handles taps natively (a tap is a `tricordarr://`
deep link); iOS does the same through `Notifications` in `TricordarrKit`. Channels and groups come from
`specs/NotificationEvents.json`, created by `PushChannels.kt`.
