Known Issues
============

### React Navigation InteractionManager

```
InteractionManager has been deprecated and will be removed in a future release. Please refactor long tasks into smaller ones, and  use 'requestIdleCallback' instead.
```

https://github.com/react-navigation/react-navigation/issues/12785

Needs to wait for React Navigation v8. Ignore the warning in v7.

### javascript-time-ago package.json

```
 WARN  The package /Users/grant/Projects/jocosocial/tricordarr/node_modules/javascript-time-ago/locale/en contains an invalid package.json configuration. Consider raising this issue with the package maintainer(s).
Reason: One or more mappings for subpaths defined in "exports" are invalid. All values must begin with "./". Falling back to file-based resolution.
```

https://gitlab.com/catamphetamine/javascript-time-ago/-/issues/7

Ignore it.

### Expo Max Sdk Override Plugin (`WRITE_EXTERNAL_STORAGE`)

```
---------- Expo Max Sdk Override Plugin ----------
>>> WARNING: Found 1 permission(s) with conflicting 'android:maxSdkVersion' declarations.
    - android.permission.WRITE_EXTERNAL_STORAGE
      > Defined WITH `android:maxSdkVersion` in: android/app/src/main/AndroidManifest.xml
      > Defined WITHOUT `android:maxSdkVersion` in: .../react-native-image-crop-picker/..., .../expo.modules.filesystem-.../AndroidManifest.xml
>>> Removing 'android:maxSdkVersion' from these permissions in the final manifest to prevent runtime issues.
>>> Removed 'android:maxSdkVersion' from 1 instance(s) in the final manifest.
--------------------------------------------------
```

Expo SDK 55+ applies `expo-max-sdk-override-plugin` during Android builds. It notices that some manifests declare `WRITE_EXTERNAL_STORAGE` with `android:maxSdkVersion` and others (notably `react-native-image-crop-picker`) declare it without a cap, then strips the cap from the final merged manifest. This is informational only and does not fail the build.

Do not remove the app's `android:maxSdkVersion="32"` and `tools:replace="android:maxSdkVersion"` in `android/app/src/main/AndroidManifest.xml`. That override is still required to resolve a separate, hard AGP manifest-merger conflict between `react-native-image-crop-picker` (`maxSdkVersion="29"`) and `expo-file-system` (`maxSdkVersion="32"`). Removing it causes `processReleaseMainManifest` to fail.

Ignore the plugin warning.

### A file you didn't touch went missing

Seems to happen if renaming or moving components around. The best answer I have for this a "React Ghost". Reboot your laptop. Seriously.

Historical
----------

```
 ERROR  Warning: A props object containing a "key" prop is being spread into JSX:
  let props = {key: someKey, route: ..., borderless: ..., centered: ..., rippleColor: ..., onPress: ..., onLongPress: ..., testID: ..., accessibilityLabe
l: ..., accessibilityRole: ..., accessibilityState: ..., style: ..., children: ...};
  <Touchable {...props} />
React keys must be passed directly to JSX without using spread:
  let props = {route: ..., borderless: ..., centered: ..., rippleColor: ..., onPress: ..., onLongPress: ..., testID: ..., accessibilityLabel: ..., access
ibilityRole: ..., accessibilityState: ..., style: ..., children: ...};
  <Touchable key={someKey} {...props} />
```

https://github.com/callstack/react-native-paper/issues/4401 (PR: https://github.com/callstack/react-native-paper/pull/4494)

```
 ERROR  Warning: TextInput.Icon: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default para
meters instead.
    in TextInput.Icon (created by Formik)
```

Fixed in react-native-paper 5.12.5

```
[Xcodeproj] Unable to find compatibility version string for object version 70.
```

https://github.com/CocoaPods/CocoaPods/issues/12671#issuecomment-2467142931

### Text props containing key

```
A props object containing a "key" prop is being spread into JSX:
  let props = {key: someKey, selectable: ..., style: ..., variant: ..., children: ..., ref: ...};
  <Text {...props} />
React keys must be passed directly to JSX without using spread:
  let props = {selectable: ..., style: ..., variant: ..., children: ..., ref: ...};
  <Text key={someKey} {...props} /> Error Stack:
```

Unrecorded bug in https://github.com/obipawan/react-native-hyperlink. Patched in this repo.

### Xcode build errors involving rsync

```
tricordarr/ios/rsync(96533):1:1 QBImagePicker.bundle/QBImagePicker.storyboardc/QBAlbumsNavigationController.nib: unlinkat: Directory not empty
```

Stale Xcode derived data. Delete everything in `~/Library/Developer/Xcode/DerivedData/` and rebuild in Xcode.

### Cursor agent doesn't show up

```
Specified worker not found or you do not have access to it.
```

After running `cursor agent worker start`.

You MUST have the `git` user in the repo URL in `.git/config` (`url = git@github.com:jocosocial/tricordarr`). This is absolutely stupid.

### Local EAS iOS production: provisioning profile doesn't include signing certificate

```
Provisioning profile "*[expo] com.grantcohoe.tricordarr AppStore …" doesn't include signing certificate "Apple Distribution: Grant Cohoe (67V85M2YSV)".
Provisioning profile "*[expo] com.grantcohoe.tricordarr.LocalPushExtension AppStore …" doesn't include signing certificate "Apple Distribution: Grant Cohoe (67V85M2YSV)".
```

Local `eas build --local --platform ios --profile production` only. Same display name, different cert serials: the login keychain still has an older Apple Distribution identity, while Expo's App Store profiles are bound to the EAS-stored cert. `security find-identity -v -p codesigning` prints SHA-1, not serial — compare serials with `eas credentials` (production, both `Tricordarr` and `LocalPushExtension`) and `security find-certificate -c "Apple Distribution: Grant Cohoe" -p | openssl x509 -noout -serial`.

Delete the leftover `Apple Distribution` cert from the login keychain. Leave `Apple Development` identities. Do not regenerate the distribution certificate; regenerate profiles only if they are not already bound to the current EAS cert.

https://github.com/expo/eas-cli/issues/1201

### Flashlist Version Expo Doctor

```
npx expo-doctor
...
...
⚠️ Minor version mismatches
package                  expected  found
@shopify/flash-list      2.0.2     2.3.2
```

Do not downgrade. The doc is dumb.
