Tricordarr
==========

A [Twitarr](https://github.com/jocosocial/swiftarr) client.

Quick Start
-----------

```bash
nvm install lts/jod # v22.18.0
nvm use lts/jod

npm clean-install

# Android (Mac, Windows, Linux)
npx expo run:android

# iOS (Mac)
npx pod-install
npx expo run:ios --scheme Development # or Production, --device "Simulator Name"
```

Testing
-------

There is no CI for tests yet — lint runs on push, but unit and end-to-end tests only run
where you run them. Please exercise both locally before opening a PR.

```bash
npm test        # unit tests (Jest)
npm run typecheck
npm run lint
```

End-to-end flows live in `__tests__/e2e/` and run on
[Maestro](https://maestro.mobile.dev). Install it with the official installer
(`curl -Ls "https://get.maestro.mobile.dev" | bash`), which needs a JDK and drops into
`~/.maestro/bin`. The Homebrew formula fails if your Command Line Tools are older than
your Xcode.

Flows drive a real app against a real server, so before running them you need a
[swiftarr](https://github.com/jocosocial/swiftarr) instance, the app built and installed
on a simulator or emulator, Metro running (`npx expo start --dev-client`), and the app
signed in. The `Emulator` server preset points at port `3050`, so set `SWIFTARR_PORT=3050`
in your swiftarr `development.env` if you want that preset to work.

```bash
# iOS
maestro test -e APP_ID=com.grantcohoe.tricordarr __tests__/e2e/Forum/ForumPostReply.yaml

# Android — note the different app ID
maestro test -e APP_ID=com.tricordarr __tests__/e2e/Forum/ForumPostReply.yaml

# With both a simulator and an emulator running, name the target
maestro --device emulator-5554 test -e APP_ID=com.tricordarr <flow>.yaml
```

Two things that will save you time. On Android, use an AVD built from a **non-Play**
system image (`google_apis`, not `google_apis_playstore`); Play images set
`ro.adb.secure=1` and pop an "Allow USB debugging" dialog that nothing can dismiss
programmatically, because every tool you would use goes through adb. Also disable the
system handwriting overlay, which otherwise swallows the first `inputText`:
`adb shell settings put secure stylus_handwriting_enabled 0`.

A flow that passes is not automatically a flow that tests anything. Before trusting a new
one, break the code it covers and confirm it fails — assertions that match any visible
text will happily match rendered content instead of the widget you meant.

See [docs/Testing.md](./docs/Testing.md) for `testID` conventions and
[Docs](./docs/) for more.
