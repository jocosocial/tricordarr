# Links

How `https` links from outside the app open Tricordarr, through iOS Universal Links and Android App Links.
Links tapped inside the app go through `openWebUrl` in `LinkingProvider.tsx` instead.

## Claimed Hosts

Hosts are fixed at build time, so changing them requires a new build. Keep these lists in sync. `__tests__/unit/TestLinking.ts`
fails if they drift.

| Build   | Hosts                                                                       | JS list            | iOS                             | Android                           |
| ------- | --------------------------------------------------------------------------- | ------------------ | ------------------------------- | --------------------------------- |
| Release | `twitarr.com`, `start.twitarr.com`                                          | `releaseLinkHosts` | `Tricordarr.entitlements`       | `src/release/AndroidManifest.xml` |
| Debug   | `twitarr.com`, `start.twitarr.com`, `beta.twitarr.com`, `alpha.twitarr.com` | `debugLinkHosts`   | `Tricordarr.Debug.entitlements` | `src/debug/AndroidManifest.xml`   |

`www.twitarr.com` isn't claimed because it redirects, and both platforms need the well-known files served without a redirect.

## Claimed Paths

The app claims every path on those hosts.

- **iOS:** the server's `/.well-known/apple-app-site-association` lists `/*`, so paths can change without an app build.
- **Android:** the intent filters have no path elements, so changing this needs a new build. The server's
  `/.well-known/assetlinks.json` only approves the app and its signing certificates.

## Shared Logins

The same hosts share saved logins with the website, so password managers can offer them on the login screen.

- **iOS:** `webcredentials:` entries in the entitlements, plus the `webcredentials` block in the server's
  `apple-app-site-association`.
- **Android:** the `asset_statements` string in `src/<build type>/res/values/asset_statements.xml`, plus the
  `common.get_login_creds` relation in the server's `assetlinks.json`.

## Routing

Each host must serve its own well-known files. Once the OS hands the app a link, `shouldRouteIncomingLink` in `UrlParser.ts`
decides what happens:

- Links are dropped until OOBE is complete, since a link's initial state would otherwise skip it.
- A link on the session's server, or on a canonical host like `twitarr.com`, opens on the session's server.
- Any other claimed host shows the alert from `ForeignLinkHandler`, which offers to open it in a browser, and doesn't navigate.

A path with no native route falls through to `SiteUILinkScreen`. ID params only match UUIDs, so pages like `/forum/search`
reach it too.

Claiming every path has known gaps. Downloads like `.ics` files and vCards load in the WebView, and a link to `/` opens the app
without navigating.

To leave the app, use `openInBrowser` in `src/Libraries/Browser.ts`. `Linking.openURL` on a claimed URL comes straight back to the
app, and so does a Custom Tab that doesn't name a browser.

## Checking What Devices See

Devices read these cached copies rather than the server, so they can lag behind it. Replace `twitarr.com` with the host you're checking.

- **iOS:** [https://app-site-association.cdn-apple.com/a/v1/twitarr.com](https://app-site-association.cdn-apple.com/a/v1/twitarr.com)
- **Android:** [https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://twitarr.com](https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://twitarr.com)

## Testing

Verification needs public internet, so this won't work for the first time on ship wifi.

Test killed-app links on a release build. In a debug build on Android, a link that starts the app stops at Expo's dev launcher, and the
app's JS never loads.

### iOS

Send a link with `xcrun simctl openurl booted <url>`, or tap one in Messages or Notes. Typing it into Safari's address bar
won't open the app.

The download happens around install. If it fails, the simulator can keep failing without retrying soon, so install the app again
over the top. Look for `SWCERR` errors with:

```
xcrun simctl spawn booted log show --last 5m --info --debug --predicate 'process == "swcd"'
```

### Android

Debug builds can't verify any host, because the debug certificate isn't in `assetlinks.json` and shouldn't be added. On Android
12 and higher, approve a host by hand:

```
adb shell pm set-app-links-user-selection --user 0 --package com.tricordarr true alpha.twitarr.com
```

Release-signed builds verify for real. Check the result and send a link with:

```
adb shell pm get-app-links com.tricordarr
adb shell am start -a android.intent.action.VIEW -d https://twitarr.com/forums
```

Android 11 and lower fail verification for every host if any one host fails, so every release host must serve `assetlinks.json`
before an Android release.
