# Images

Saving asset images is being disabled until we can sort out the pathing nonsense.

Images come from a number of sources:

API: `/api/v3/image/${size}/UUID.jpg`

Asset: an `http://10.0.2.2` esque source for debug, and `asset_filename_without_extension` in release

Post: base64 data from the form values

## Image Flow

By default we set `appConfig.skipThumbnails` to `false` which means that for API-based images we should fetch the thumbnail path first (`/api/v3/image/thumb`). This is what should be used for rendering the image.

Many image components need to be displayed in a "scaled" manor, sized to 100% width but maintaining their aspect ratio. `FastImage` was patched to have a `getSize()` which will provide the dimensions necessary similar to `Image`.

After a timer period the `APIImage` should dispatch a preload call to load the full-size image from the server. By default this is 5 seconds.

The net result is that there should only ever be two image queries: thumbnail, then full-size.
