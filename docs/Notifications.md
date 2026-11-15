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

- `accountID` is an opaque string. Until the account model lands JS passes the current
  `sessionID` (`getCurrentPushAccountID()` in `Push/PushAccounts.ts`).
- `PushNotificationService` starts/stops the service and re-syncs when the push preferences,
  mute time, `urlPrefix`, or session token change. The native filter uses the synced copy.
- Sign-out syncs `[]`, which also drops the stored token.
- Notification taps are `tricordarr://` deep links with `?account=<accountID>` (ignored by JS for
  now). Each notification is tagged `acct:<accountID>`.
- The JS in-app notification socket (`SocketProvider`) still runs while the app is foregrounded, for
  cache invalidation. The native service posts the notifications.

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

`TricordarrKit/WebsocketNotifier.swift` owns the socket inside the local push extension and posts
notifications natively. JS drives it through `setupLocalPushManager`; `syncPushAccounts` is a thin
single-account wrapper over the same code. `getWebsocketStatus()` returns one entry with
`accountID: "default"`.

## notify-kit

Still used on iOS (`getInitialNotification`, `onForegroundEvent`, `cancelDisplayedNotification`),
for channel creation, the developer test screen, and the Android call foreground service. Its
Android autolinking cannot be excluded until calls leave its service.
