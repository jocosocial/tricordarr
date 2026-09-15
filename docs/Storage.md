# Storage

## Map

Sessions and tokens: `expo-secure-store` via `SessionStorage.ts`.

Small scalar config: AsyncStorage via `StorageKeys` in `src/Libraries/Storage/index.ts` (`AppConfig`, FGS healthcheck, FGS start time).

React Query cache: a file in the documents directory via `QueryCacheStorage.ts`. One file per session, named `query-cache-${sessionID}.json`.

Images: the filesystem via `ImageStorage.ts`.

## Why the query cache is a file

Android AsyncStorage's default export is still the legacy v2 Room/SQLite backend. Each key is one row, and reads go through `CursorWindow`, which caps a single value at about 2MB. Writes past that succeed; the next cold-start read fails with `Row too big to fit into CursorWindow`. Total AsyncStorage is also capped around 6MB. A 30-day `gcTime` query cache blows past both.

`expo-file-system` has no per-value ceiling and no 6MB total cap, so the whole cache can live in one file. Hard cutover: old `REACT_QUERY_CACHE_*` AsyncStorage rows are abandoned.

## Tradeoffs

`File.write` is synchronous and blocks the JS thread. So does `superjson.stringify`, which dominates. If write jank ever shows up, `File.open()` / `writableStream()` are the escape hatch.

File writes are not atomic. The adapter writes a `.tmp` sibling then `moveSync`s over the target.

Restore is all-or-nothing: one corrupt file discards the whole cache. TanStack already does that cleanup in `persistQueryClientRestore`.

Deleting a session does not remove its persisted cache, so orphans accumulate (previously AsyncStorage rows, now files). `deleteSession` in `SessionProvider.tsx` is where that would be fixed.

## Rule

Keep AsyncStorage for small scalar config only. Anything that can grow unbounded goes to the filesystem.
