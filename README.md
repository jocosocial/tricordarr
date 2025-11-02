Tricordarr
==========

A friendly React Native client for Twitarr — the social platform used in the Swiftarr project.

Interactive Quick Start
-----------------------

Follow these steps to get running quickly. Pick the platform you work on.

Prerequisites
- Node: use an active LTS (the repo previously used Node 22.x). We recommend using nvm.
- Yarn or npm (this repo uses npm in examples).
- Java JDK + Android SDK for Android builds.
- Xcode + CocoaPods for iOS builds on macOS.

1) Install and switch Node (example with nvm)

~~~powershell
nvm install --lts
nvm use --lts
~~~

2) Install dependencies

~~~powershell
# Clean install dependencies (Windows PowerShell)
npm ci
# or, if you need to reinstall and rebuild native deps:
# npm run clean-install
~~~

Platform: Android (Windows, Mac, Linux)

~~~powershell
# Start Metro in one terminal
npx react-native start

# In another terminal build + install on a connected device or emulator
npx react-native run-android
~~~

Platform: iOS (macOS only)

~~~bash
# Install CocoaPods
npx pod-install

# Run on the iOS simulator (scheme: Development or Production)
npx react-native run-ios --scheme Development
~~~

Running tests
-------------

The project uses Jest for unit tests. Run:

~~~powershell
npm test
~~~

Helpful developer commands

- Start Metro (bundler): npx react-native start
- Build Android: npx react-native run-android
- Build iOS (macOS): npx react-native run-ios --scheme Development
- Format / lint (if configured): see package.json scripts

Where to look next (interactive tips)
- Need to change theme or styles? Look in `src/Styles/` and `src/Components/Views/`.
- Want to add a screen? Follow existing patterns in `src/Screens/` and register routes in `src/Navigation/`.
- Native bridge code lives in `ios/NativeTricordarrModule`.

Troubleshooting
---------------

- Metro cache issues: try `npx react-native start --reset-cache`.
- Android build errors: confirm Android SDK, set `ANDROID_HOME` and open the project in Android Studio to inspect Gradle logs.
- iOS CocoaPods issues: from `ios/` run `pod install --repo-update` and then clean build folder in Xcode.

Contributing
------------

We welcome contributions. A quick checklist for contributors:

1. Fork the repo and create a branch for your feature or fix.
2. Keep changes focused and add tests where possible (Jest files live under `__tests__/`).
3. Run the test suite and lint/format before raising a PR.
4. Open a pull request describing the change and linking any relevant issues.

See `CONTRIBUTING.md` (if present) and `TESTING.md` for repository-specific guidance.

Docs and further reading
------------------------

The repository contains a `docs/` folder with design notes, upgrade guides, and testing tips. Browse it for architecture details and migration notes.

License
-------

This project is licensed under the terms in the `LICENSE` file.

Contact / Support
-----------------

If you hit an issue that you can't resolve locally, open an issue with reproduction steps and relevant logs. Include platform (Android/iOS), Node version, and any error output.

Quick cheatsheet
---------------

~~~powershell
# Start development
npx react-native start
# Android
npx react-native run-android
# iOS (macOS)
npx pod-install; npx react-native run-ios --scheme Development
# Run tests
npm test
~~~

Thanks for using and contributing to Tricordarr — happy hacking!
