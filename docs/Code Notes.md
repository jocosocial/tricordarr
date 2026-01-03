# Code Notes

## Query

`isLoading`: no cache and in flight

- Return `<LoadingView />`

`isRefetching`: Background refetch (excluding initial) and `refetch()`.

- RefreshControl

`refetch()` will refetch even if within the staleTime. Backgrounds will not because that's the point of staleTime.

`isFetching`: Catchall for any time the query function is running. This should be the default solution.

A useful debugging snippet:

```ts
const allJoinedQueries = queryClient
  .getQueryCache()
  .getAll()
  .filter(q => Array.isArray(q.queryKey) && q.queryKey[0] === '/fez/joined');

console.log('[PersonalEvents] total /fez/joined queries:', allJoinedQueries.length);
allJoinedQueries.forEach((q, i) => {
  console.log(`[PersonalEvents] query ${i} key:`, JSON.stringify(q.queryKey));
  console.log(`[PersonalEvents] query ${i} dataUpdatedAt:`, new Date(q.state.dataUpdatedAt).toISOString());
});
```

## Native Code

### Codegen

Do not attempt to run `npx @react-native-community/cli codegen` or `npx react-native codegen`. Those commands are not fully baked and undocumented. If you want to re-run Codegen just do a build.

```
[Codegen] Analyzing /Users/grant/Projects/jocosocial/tricordarr/package.json
[Codegen] TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined
[Codegen] Done.
```

That is because the `--outputDir` is empty. And there isn't an easy way to automatically set the correct output directories. Can be done, but ugh.

### Android Studio

Open the `android` directory in Android Studio instead of the project root. It behaves better. Might be able to mark a different one as Project Root?
https://stackoverflow.com/questions/70816347/i-cant-find-the-image-asset-option-in-android-studio

### Xcode

Open the `ios` directory in Xcode or `open` the `Tricordarr.xcworkspace` file.

## Refresh

To refresh without glitches:

```ts
const [refreshing, setRefreshing] = React.useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await Promise.all([refetch(), refetchPins()]);
  setRefreshing(false);
};
```

`refetchPage` can be passed to `refetch` to limit refetching - CITATION NEEDED

## Websocket Keepalive

https://www.w3.org/Bugs/Public/show_bug.cgi?id=13104

## Swiftarr API

- All dates from the API come in as ISO8601 strings

## RefreshControl

React Native (as of at least 0.82) `RefreshControl` does not support `enabled` on iOS so we use a wrapper `AppRefreshControl` which returns null (an AI-recommended pattern).
