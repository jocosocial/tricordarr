Tricordarr
==========

A [Twitarr](https://github.com/jocosocial/swiftarr) client.

Quick Start
-----------
```
nvm install lts/hydrogen
nvm use lts/hydrogen(v18.14.2)

npm install

npx react-native start

npx uri-scheme open tricordarr:// --android
```

Notes
-----
* Uninstall terminates FGS. Yeah it does.
* Icon library: https://pictogrammers.com/library/mdi/
* navigation.setOptions must be called witin a useEffect else you get
  an error that youre trying to update a parent component during another component.
* https://www.w3.org/Bugs/Public/show_bug.cgi?id=13104
* refetchPage can be passed to refetch to limit refetching


Releasing
---------
https://reactnative.dev/docs/signed-apk-android

```
cd android
./gradlew bundleRelease # To build AAB
./gradlew assembleRelease # For an APK
```
