# Dependencies

## References

- https://reactnative.directory/

## Deprecation

These modules are unsupported and need to go:

None!

## Transitive dependency overrides (security)

`package.json` uses npm `overrides` to force patched versions of vulnerable transitive dependencies:

- **diff** (pinned to 5.2.2): pulled in by `react-native-controlled-mentions`. Upstream still depends on vulnerable 5.0.0; the override resolves the DoS advisory (parsePatch/applyPatch). When the library updates its dependency range, the override can be removed.
- **markdown-it** (pinned to 14.3.3): pulled in by `@ronradtke/react-native-markdown-display`. Upstream declares `^13.0.1`; 14.3.0 fixes the ReDoS in linkify. When the library depends on markdown-it@14.1.1+, the override can be removed.
- **uuid**, scoped to `xcode` (pinned to 11.1.1): `xcode` (a transitive dep of the Expo config-plugins toolchain) declares vulnerable `^7.0.3`. 11.1.1 fixes the buffer-bounds-check advisory (GHSA-w5hq-g745-h8pq); `xcode` only calls `uuid.v4()`, which is unchanged. Scoped to `xcode` specifically because the app also has a direct, already-patched `uuid@^14.0.1` dependency that a global override would conflict with. When `xcode` updates its range, the override can be removed.

## Upstream fixes carried as patches

- **@mattermost/react-native-paste-input** (2.0.1, `patches/@mattermost+react-native-paste-input+2.0.1.patch`): applies three open upstream PRs, without which image paste into composers does nothing. Drop each part once a release includes it.
  - [#58](https://github.com/mattermost/react-native-paste-input/pull/58): Android long-press → Paste of an image produced no event; also stops the podspec from requiring `RCT_NEW_ARCH_ENABLED`, which RN 0.82+ no longer sets before autolinking.
  - [#55](https://github.com/mattermost/react-native-paste-input/pull/55): iOS never registered the input on Fabric (`__nativeTag` is undefined).
  - [#56](https://github.com/mattermost/react-native-paste-input/pull/56): iOS couldn't find the text view under Expo, because `setup` captured a `reactHost` that Expo creates later.
  - React Native 0.88 only forward-declares `RCTSurfacePresenterBridgeAdapter`, so the bridge-mode fallback in `PasteInputModule.mm` talks to the adapter through `id` instead of the class.
  - The package ships no Swift module, so `AppDelegate.swift` reaches `PasteInputModule.setup` through a declaration in `Tricordarr-Bridging-Header.h` rather than an `import`.
- **@d11/react-native-fast-image** (8.13.0, `patches/@d11+react-native-fast-image+8.13.0.patch`): besides its other changes, its typings made `ImageStyle` extend `FlexStyle` and `ShadowStyleIOS`, which React Native 0.88 no longer exports. The patch extends React Native's own `ImageStyle` instead. Without it every `FastImage` `style` prop fails to typecheck.
- **react-native-image-crop-picker** (0.52.0, `patches/react-native-image-crop-picker+0.52.0.patch`): turns the iOS camera flash off by default instead of leaving it on Auto.
