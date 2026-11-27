# Upgrading

Specifically related to Expo SDK and React Native upgrades.

The React Native upgrade process is miserable. Don't do it. Or if you do, at least do it on a clean dedicated branch. `npm install` doesn't honor `package-lock.json`, you need `npm clean-install` (aka `npm ci`) for that.

`ios/` and `android/` are hand-managed. Never run `npx expo prebuild` in the repo. To see what a new SDK changes natively, diff the previous and new `expo-template-bare-minimum` packages (`npm pack expo-template-bare-minimum@sdk-NN`) and apply the differences by hand.

## Checklist

1. `npm ci`, then record the baseline from `docs/Testing.md` (typecheck, lint, tests) on `main`.
2. Check the Node requirement of the new SDK against `engines` in `package.json` and the EAS build images.
3. `npx expo install expo@^NN.0.0`, then `npx expo install --fix`, then `npx expo-doctor@latest`. Review every dependency change. `expo.install.exclude` in `package.json` lists packages we deliberately keep off Expo's pins (async-storage 3, gesture-handler, jest 29, and so on); `--fix` also rewrites anything not listed there, and may add entries to `app.json` that should be reverted.
4. Move the `@react-native/*` dev packages to the new React Native version by hand; `--fix` does not.
5. Check `overrides` in `package.json` (see `docs/Dependencies.md`). Overrides pinning a tool to the previous React Native's version, such as Metro, usually need to go.
6. Every file in `patches/` is pinned to an exact package version. Anything that was bumped fails `patch-package`: check whether upstream fixed it, otherwise rebase and regenerate with `npx patch-package <package>` (see `CLAUDE.md` for the artifact cleanup).
7. Fix TypeScript. Since React Native 0.87 the Strict TypeScript API is the default: no deep imports, and refs use `ViewInstance`, `ScrollViewInstance` and `TextInputInstance`.
8. iOS: delete `ios/Pods` and `ios/Podfile.lock` if `pod install` complains about stale local podspecs, run `npx pod-install`, then build with Xcode.
9. Android: diff `android/` against the new template, then do a full clean build (`./gradlew clean :app:assembleDebug`). Incremental builds hide missing native module overrides.
10. Launch on an iOS simulator for the newest iOS, an older iOS, and an Android emulator. Cold-launch from a `tricordarr://` link, a universal link and a notification.

## Upgrade Helper

https://react-native-community.github.io/upgrade-helper/

App Name: `Tricordarr`
App Package: `com.tricordarr`

## Dependencies

Check for updates with `npm outdated`.
