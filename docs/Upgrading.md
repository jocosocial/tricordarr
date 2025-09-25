Upgrading
=========

The React Native upgrade process is miserable. Don't do it. Or if you do, at least
do it on a clean dedicated branch. `npm install` doesn't honor `package-lock.json`,
you need `npm clean-install` for that.

```shell
npx @rnx-kit/align-deps --requirements react-native@0.72
```

Package History
---------------
* `react-native-fast-image` is toast. Switched to `@d11/react-native-fast-image` which is the same thing but more recently developed.
* `react-native-config` has an Android build issue with `1.5.9`. See https://github.com/lugg/react-native-config/issues/848. Locked to `1.5.5` instead.