Tricordarr
==========

A [Twitarr](https://github.com/jocosocial/swiftarr) client.

Quick Start
-----------
```bash
nvm install lts/jod
nvm use lts/jod (v22.13.0)

npm clean-install
patch-package

npx react-native start

npx uri-scheme open tricordarr:// --android
```

Notes
-----
* Icon library: https://pictogrammers.com/library/mdi/
* https://www.w3.org/Bugs/Public/show_bug.cgi?id=13104
* refetchPage can be passed to refetch to limit refetching
* All dates from the API come in as ISO8601 strings
* `adb logcat [| grep ReactNativeJS]` can get logs on the device

Navigation
----------
```ts
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
```ts
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

Layout Consideration
--------------------
### General
* Every screen should have Help. Whether directly in the header or under a menu.

### Screen Headers / Menus
* Most screens should have an Actions Menu (three dots) in the upper right.
* Common actions, then privileged actions separated on both sides by divider, help
* Other than the Menu, acceptable Header buttons are [Filter, Sort, Search].
* If just help, skip the menu and use that as the icon where the menu would be

### FABs
* Screens where there is a "create" action should have that Create be in the form of a FAB

Known Issues
------------
```
 ERROR  Warning: A props object containing a "key" prop is being spread into JSX:
  let props = {key: someKey, route: ..., borderless: ..., centered: ..., rippleColor: ..., onPress: ..., onLongPress: ..., testID: ..., accessibilityLabel: ..., accessibilityRole: ..., accessibilityState: ..., style: ..., children: ...};
  <Touchable {...props} />
React keys must be passed directly to JSX without using spread:
  let props = {route: ..., borderless: ..., centered: ..., rippleColor: ..., onPress: ..., onLongPress: ..., testID: ..., accessibilityLabel: ..., accessibilityRole: ..., accessibilityState: ..., style: ..., children: ...};
  <Touchable key={someKey} {...props} />
```
https://github.com/callstack/react-native-paper/issues/4401 (PR: https://github.com/callstack/react-native-paper/pull/4494)

```
 ERROR  Warning: TextInput.Icon: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.
    in TextInput.Icon (created by Formik)
```
Fixed in react-native-paper 5.12.5

Production Build
----------------

At the root of the repo need `local.properties`:
```bash
TRICORDARR_UPLOAD_STORE_FILE=../../Tricordarr-Upload.keystore
TRICORDARR_UPLOAD_STORE_PASSWORD=redacted
TRICORDARR_UPLOAD_KEY_ALIAS=tricordarr-upload
TRICORDARR_UPLOAD_KEY_PASSWORD=redacted
```

Then put the keystore there too.