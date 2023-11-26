Tricordarr
==========

A [Twitarr](https://github.com/jocosocial/swiftarr) client.

Quick Start
-----------
```
nvm install lts/gallium
nvm use lts/fermium (v16.19.1)

npm install # or npm clean-install

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


Releasing
---------
https://reactnative.dev/docs/signed-apk-android

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
