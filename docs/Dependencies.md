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
- **decode-uri-component** (pinned to 0.5.0): pulled in by `query-string` (via `@react-navigation/core`), which declares vulnerable `^0.2.2`. 0.5.0 fixes the exponential-decoding DoS advisory (GHSA-vcc3-ghjq-m6fr) and keeps the same `decode(input)` function signature. When `query-string`/`@react-navigation/core` update their range, the override can be removed.
- **uuid**, scoped to `xcode` (pinned to 11.1.1): `xcode` (a transitive dep of `react-native-notify-kit` and the Expo config-plugins toolchain) declares vulnerable `^7.0.3`. 11.1.1 fixes the buffer-bounds-check advisory (GHSA-w5hq-g745-h8pq); `xcode` only calls `uuid.v4()`, which is unchanged. Scoped to `xcode` specifically because the app also has a direct, already-patched `uuid@^14.0.1` dependency that a global override would conflict with. When `xcode` updates its range, the override can be removed.
- **metro**, **metro-config**, **metro-transform-worker** (pinned to 0.84.6): `@react-native/metro-config` and `@react-native/community-cli-plugin` (both part of `react-native@0.86.2`) declare `^0.84.3`, which npm was resolving down to the vulnerable `0.84.4`. Metro dropped its `image-size` dependency (DoS advisories GHSA-w3rx-r6r6-pgpr, GHSA-5p2g-fcmc-qvqq) starting in `0.84.5`; `0.84.6` is the latest patch and still satisfies the declared range, so this is not a breaking bump. `@expo/metro`'s bundled Metro was already unaffected (it ships `0.84.5`+ on its own). Verified with `expo export --platform ios` that bundling still works. This override can be removed once `react-native`'s own lockfile/resolution picks up `metro@0.84.5+` by default.
