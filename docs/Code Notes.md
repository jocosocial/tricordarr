Code Notes
==========

Query
-----

`isLoading`: no cache and in flight
* Return `<LoadingView />`

`isRefetching`: Background refetch (excluding initial) and `refetch()`.
* RefreshControl

`refetch()` will refetch even if within the staleTime. Backgrounds will not because that's the point of staleTime.

`isFetching`: Catchall for any time the query function is running. This should be the default solution.

Native Code
-----------

### Android Studio

Open the `android` directory in Android Studio instead of the project root. It behaves better.
Might be able to mark a different one as Project Root?
https://stackoverflow.com/questions/70816347/i-cant-find-the-image-asset-option-in-android-studio

### Xcode

Open the `ios` directory in Xcode or `open` the `Tricordarr.xcworkspace` file.

Refresh
-------

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

Websocket Keepalive
-------------------

https://www.w3.org/Bugs/Public/show_bug.cgi?id=13104

Swiftarr API
------------

* All dates from the API come in as ISO8601 strings