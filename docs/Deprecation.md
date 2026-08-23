# Deprecation

These modules are unsupported and need to go:

None!

## Transitive dependency overrides (security)

`package.json` uses npm `overrides` to force patched versions of vulnerable transitive dependencies:

- **diff** (pinned to 5.2.2): pulled in by `react-native-controlled-mentions`. Upstream still depends on vulnerable 5.0.0; the override resolves the DoS advisory (parsePatch/applyPatch). When the library updates its dependency range, the override can be removed.
- **markdown-it** (pinned to 14.1.1): pulled in by `@ronradtke/react-native-markdown-display`. Upstream declares `^13.0.1`; 14.1.1 fixes the ReDoS in linkify. When the library depends on markdown-it@14.1.1+, the override can be removed.
