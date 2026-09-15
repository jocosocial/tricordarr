Debugging
=========

## Development build on physical device

```sh
npx expo run:android --device Pixel_11_Pro # or without a device name to get a list
```

Then if you need to reverse shell a port, use the `adb devices` name

```sh
adb -s adb-yadayada-abc123._adb-tls-connect._tcp reverse tcp:7848 tcp:7848
```

## Logs

```sh
adb logcat | grep ReactNativeJS
```
