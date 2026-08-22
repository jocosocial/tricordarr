# Images

## Image Flow

By default we set `appConfig.skipThumbnails` to `false` which means that for API-based images we should fetch the thumbnail path first (`/api/v3/image/thumb`). This is what should be used for rendering the image.

Many image components need to be displayed in a "scaled" manor, sized to 100% width but maintaining their aspect ratio. `FastImage` was patched to have a `getSize()` which will provide the dimensions necessary similar to `Image`.

After a timer period the `APIImage` should dispatch a preload call to load the full-size image from the server. By default this is 5 seconds.

The net result is that there should only ever be two image queries: thumbnail, then full-size.

## Sources

Images come from a number of sources:

API: `/api/v3/image/${size}/UUID.jpg`

Asset: `require()` of a bundled file. `Image.resolveAssetSource().uri` is an `http://10.0.2.2` (or localhost) Metro URL in debug, a bundle `file://` on iOS, and a scheme-less drawable resource name (e.g. `asset_mainview_day`) on Android Release. RN `Image` can display that drawable name; `react-native-image-viewing` cannot size it via `getSizeWithHeaders`, so the viewer is given the original `assetSource` number instead. Saving unpacks the resource with `expo-asset` `downloadAsync()` into a real cache file, then copies it to the camera roll.

Post: base64 data from the form values
