# Dependencies

## References

- https://reactnative.directory/

## Deprecation

These modules are unsupported and need to go:

None!

## Transitive dependency overrides (security)

`package.json` uses npm `overrides` to force patched versions of vulnerable transitive dependencies:

- **diff** (pinned to 5.2.2): pulled in by `react-native-controlled-mentions`. Upstream still depends on vulnerable 5.0.0; the override resolves the DoS advisory (parsePatch/applyPatch). When the library updates its dependency range, the override can be removed.
- **markdown-it** (pinned to 14.3.0): pulled in by `@ronradtke/react-native-markdown-display`. Upstream declares `^13.0.1`; 14.3.0 fixes the ReDoS in linkify. When the library depends on markdown-it@14.1.1+, the override can be removed.
- **uuid**, scoped to `xcode` (pinned to 11.1.1): `xcode` (a transitive dep of the Expo config-plugins toolchain) declares vulnerable `^7.0.3`. 11.1.1 fixes the buffer-bounds-check advisory (GHSA-w5hq-g745-h8pq); `xcode` only calls `uuid.v4()`, which is unchanged. Scoped to `xcode` specifically because the app also has a direct, already-patched `uuid@^14.0.1` dependency that a global override would conflict with. When `xcode` updates its range, the override can be removed.
- **metro**, **metro-config**, **metro-transform-worker** (pinned to 0.84.6): `@react-native/metro-config` and `@react-native/community-cli-plugin` (both part of `react-native@0.86.3`) declare `^0.84.3`, which npm was resolving down to the vulnerable `0.84.4`. Metro dropped its `image-size` dependency (DoS advisories GHSA-w3rx-r6r6-pgpr, GHSA-5p2g-fcmc-qvqq) starting in `0.84.5`; `0.84.6` is the latest patch and still satisfies the declared range, so this is not a breaking bump. `@expo/metro`'s bundled Metro was already unaffected (it ships `0.84.5`+ on its own). Verified with `expo export --platform ios` that bundling still works. This override can be removed once `react-native`'s own lockfile/resolution picks up `metro@0.84.5+` by default.

## Local patches

- **@shopify/flash-list** (pinned to exactly `2.3.3`, `patches/@shopify+flash-list+2.3.3.patch`): not an upstream backport. It changes prepend handling in FlashList's data-update path so that loading an older chat page does not move the viewport or remount the posts on screen (details in `docs/ChatList/README.md`). The new path is opt-in through `maintainVisibleContentPosition.anchorThroughDataUpdates`, which only `ChatList` passes; every other FlashList runs stock code. The version is pinned without a range because the patch edits 2.3.3 internals and a newer release would fail to apply or apply wrongly. To upgrade, re-port the patch to the new version and re-run the chat scenarios in `docs/ChatList/README.md` ("Scenario gate", especially 1, 2 and 7).

## Upstream fixes carried as patches

- **@mattermost/react-native-paste-input** (2.0.1, `patches/@mattermost+react-native-paste-input+2.0.1.patch`): applies three open upstream PRs, without which image paste into composers does nothing. Drop each part once a release includes it.
  - [#58](https://github.com/mattermost/react-native-paste-input/pull/58): Android long-press → Paste of an image produced no event; also stops the podspec from requiring `RCT_NEW_ARCH_ENABLED`, which RN 0.82+ no longer sets before autolinking.
  - [#55](https://github.com/mattermost/react-native-paste-input/pull/55): iOS never registered the input on Fabric (`__nativeTag` is undefined).
  - [#56](https://github.com/mattermost/react-native-paste-input/pull/56): iOS couldn't find the text view under Expo, because `setup` captured a `reactHost` that Expo creates later.
  - The package ships no Swift module, so `AppDelegate.swift` reaches `PasteInputModule.setup` through a declaration in `Tricordarr-Bridging-Header.h` rather than an `import`.
