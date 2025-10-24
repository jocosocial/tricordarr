Releasing
=========

Versioning
----------

Version number plan:
* Major = Cruise Year (2023, 2024, etc)
* Minor = Release number to App Store. Moves in lockstep with `versionCode`.

Android
-------
https://reactnative.dev/docs/signed-apk-android

Edit `android/app/build.gradle` with appropriate version info.

```
cd android
./gradlew bundleRelease # To build AAB
./gradlew assembleRelease # For an APK
```

```
adb -s device-name-here install ~/Projects/jocosocial/tricordarr/android/app/build/outputs/apk/release/app-release.apk
```

iOS
---
Set the version info in Xcode. Click the target `Tricordarr` then in the `General` tab under `Identity`.