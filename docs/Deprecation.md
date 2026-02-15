# Deprecation

These modules are unspported and need to go:

- [react-native-fs](https://github.com/itinance/react-native-fs)
- [react-native-encrypted-storage](https://github.com/emeraldsanto/react-native-encrypted-storage)
- [react-native-hyperlink](https://github.com/obipawan/react-native-hyperlink)
  ** https://github.com/joshswan/react-native-autolink was suggested as an alternative.
  ** Patched around the `A props object containing a "key" prop is being spread into JSX` issue.

## Transitive dependency overrides (security)

`package.json` uses npm `overrides` to force patched versions of vulnerable transitive dependencies:

- **diff** (pinned to 5.2.2): pulled in by `react-native-controlled-mentions`. Upstream still depends on vulnerable 5.0.0; the override resolves the DoS advisory (parsePatch/applyPatch). When the library updates its dependency range, the override can be removed.
- **markdown-it** (pinned to 14.1.1): pulled in by `@ronradtke/react-native-markdown-display`. Upstream declares `^13.0.1`; 14.1.1 fixes the ReDoS in linkify. When the library depends on markdown-it@14.1.1+, the override can be removed.
