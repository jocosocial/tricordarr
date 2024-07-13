Tricordarr
==========

A [Twitarr](https://github.com/jocosocial/swiftarr) client.

Quick Start
-----------
```
nvm install lts/hydrogen
nvm use lts/hydrogen (v18.20.4)

yarn install --immutable --immutable-cache

npx react-native start

npx uri-scheme open tricordarr:// --android
```

Notes
-----
* Icon library: https://pictogrammers.com/library/mdi/
* https://www.w3.org/Bugs/Public/show_bug.cgi?id=13104
* refetchPage can be passed to refetch to limit refetching
* All dates from the API come in as ISO8601 strings

Upgrading
---------
The React Native upgrade process is miserable. Don't do it. Or if you do, at least
do it on a clean dedicated branch. `npm install` doesn't honor `package-lock.json`,
you need `npm clean-install` for that.

```shell
npx @rnx-kit/align-deps --requirements react-native@0.72
```

Releasing
---------
https://reactnative.dev/docs/signed-apk-android

Edit android/app/build.gradle with appropriate version info.

Version number plan:
* Major = Cruise Year (1 == 2022, 2 == 2023, consider using the actual year?)
* Minor = Release number to Play Store. Moves in lockstep with buildCode or whatever.

```
cd android
./gradlew bundleRelease # To build AAB
./gradlew assembleRelease # For an APK
```

Navigation
----------
```
// Push to ensure that back actually goes back somewhere useful.
rootNavigation.push(RootStackComponents.rootContentScreen, {
  screen: BottomTabComponents.lfgTab,
  params: {
    screen: LfgStackComponents.lfgOwnedScreen,
    // initial false needed here to enable the stack to popToTop on bottom button press.
    initial: false,
  },
})
```

Refresh
-------
To refresh without glitches:
```
const onRefresh = async () => {
  setRefreshing(true);
  await Promise.all([refetch(), refetchPins()]);
  setRefreshing(false);
};
```

Android Studio
--------------
Open the `android` directory in Android Studio instead of the project root. It behaves better.
Might be able to mark a different one as Project Root?
https://stackoverflow.com/questions/70816347/i-cant-find-the-image-asset-option-in-android-studio

Icons
-----
Notification: trim yes padding 0

Query
-----
`isLoading`: no cache and in flight
* Return `<LoadingView />`

`isRefetching`: Background refetch (excluding initial) and `refetch()`.
* RefreshControl

`refetch()` will refetch even if within the staleTime. Backgrounds will not because that's the point of staleTime.
