Tricordarr
==========

A [Twitarr](https://github.com/jocosocial/swiftarr) client.

Quick Start
-----------
```
nvm install lts/gallium
nvm use lts/fermium (v16.19.1)

npm install

npx react-native start
```

Notes
-----
* Uninstall terminates FGS. Doesnt seem to clear storage.
* Icon library: https://pictogrammers.com/library/mdi/
* navigation.setOptions must be called witin a useEffect else you get
  an error that youre trying to update a parent component during another component.


Releasing
---------
https://reactnative.dev/docs/signed-apk-android

```
cd android
./gradlew bundleRelease # To build AAB
./gradlew assembleRelease # For an APK
```
