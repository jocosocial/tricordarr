Releasing
=========

Versioning
----------

Version number plan:
* Major = Cruise Year (2023, 2024, etc)
* Minor = Release number to App Store. Moves in lockstep with `versionCode`.

Android
-------

### Setup

At the root of the repo need `local.properties`:

```bash
TRICORDARR_UPLOAD_STORE_FILE=../../Tricordarr-Upload.keystore
TRICORDARR_UPLOAD_STORE_PASSWORD=redacted
TRICORDARR_UPLOAD_KEY_ALIAS=tricordarr-upload
TRICORDARR_UPLOAD_KEY_PASSWORD=redacted
```

Then put the keystore there too.

### Build Release

Edit `android/app/build.gradle` with appropriate version info.

```
build-android-aab # To build AAB for Google Play Store.
npm run build-android-apk # For an APK to install directly.
```

```
adb -s device-name-here install ~/Projects/jocosocial/tricordarr/android/app/build/outputs/apk/release/app-release.apk
```

iOS
---

Set the version info in Xcode. Click the target `Tricordarr` then in the `General` tab under `Identity`.

https://stackoverflow.com/questions/51022884/ios-testflight-no-build-available-for-external-testers