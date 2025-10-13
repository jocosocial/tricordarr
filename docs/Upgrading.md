Upgrading
=========

Specifically related to React Native upgrades.

The React Native upgrade process is miserable. Don't do it. Or if you do, at least do it on a clean dedicated branch. `npm install` doesn't honor `package-lock.json`, you need `npm clean-install` (aka `npm ci`) for that.

Upgrade Helper
--------------
https://react-native-community.github.io/

App Name: `Tricordarr`
App Package: `com.tricordarr`

```shell
npx @rnx-kit/align-deps --requirements react-native@0.72
```