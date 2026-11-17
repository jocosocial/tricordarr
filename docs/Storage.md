# Storage

## Map

Accounts, sessions, tokens: see [Accounts and Sessions](Accounts%20and%20Sessions.md). Tokens are `expo-secure-store` (one value per account); the metadata is AsyncStorage. Read and written via `SessionStorage.ts` and `SessionPersistence.ts`.

Small scalar config: AsyncStorage via `StorageKeys` in `src/Libraries/Storage/index.ts` (device config, OOBE completed version).

| Store | Key | Scope |
|---|---|---|
| SecureStore | `ACCOUNT_TOKEN_V1_<accountID>` | account (secret) |
| SecureStore | `ACCOUNT_COOKIE_V1_<accountID>` | account (secret): raw `swiftarr_session` webview cookie |
| SecureStore | `LAST_SESSION_ID_V1` | device pointer; the one thing background code reads |
| AsyncStorage | `ACCOUNTS_V1`, `SESSIONS_V2`, `SERVER_PROFILES_V1` | small metadata arrays |
| AsyncStorage | `ACCOUNT_PREFS_V1_<accountID>` | account |
| AsyncStorage | `APP_CONFIG_V3` | device |
| AsyncStorage | `APP_OOBE_COMPLETED_VERSION_V1` | device |
| File | `query-cache-<sessionID>.json` | session; deleted with the session |

Tokens are in the Keychain/Keystore rather than AsyncStorage, one small value per account, which also sidesteps the ~2 KB value caution on older iOS that a single blob of every session was creeping toward.

The pre-account-model keys (`SESSIONS_DATA_V1`, `APP_CONFIG_V2`) are never read; a device that only has them starts fresh. They are left in place (the `StorageKeys` versioning convention) rather than deleted.

React Query cache: a file in the documents directory via `QueryCacheStorage.ts`. One file per session, named `query-cache-${sessionID}.json`.

Images: the filesystem via `ImageStorage.ts`.

## Why the query cache is a file

Android AsyncStorage's default export is still the legacy v2 Room/SQLite backend. Each key is one row, and reads go through `CursorWindow`, which caps a single value at about 2MB. Writes past that succeed; the next cold-start read fails with `Row too big to fit into CursorWindow`. Total AsyncStorage is also capped around 6MB. A 30-day `gcTime` query cache blows past both.

`expo-file-system` has no per-value ceiling and no 6MB total cap, so the whole cache can live in one file. Hard cutover: old `REACT_QUERY_CACHE_*` AsyncStorage rows are abandoned.

## Tradeoffs

`File.write` is synchronous and blocks the JS thread. So does `superjson.stringify`, which dominates. If write jank ever shows up, `File.open()` / `writableStream()` are the escape hatch.

File writes are not atomic. The adapter writes a `.tmp` sibling then `moveSync`s over the target.

Restore is all-or-nothing: one corrupt file discards the whole cache. TanStack already does that cleanup in `persistQueryClientRestore`.

Removing a session (or an account, which removes its sessions) deletes its cache file, and signing an account out or revoking it clears the cache of its sessions. `persistSessionState` does this by diffing the previous and next state, so no caller has to remember to.

## Rule

Keep AsyncStorage for small scalar config only. Anything that can grow unbounded goes to the filesystem.
