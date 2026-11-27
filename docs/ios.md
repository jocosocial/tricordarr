# iOS Support

Install pods: `npx pod-install`.

```
==================== DEPRECATION NOTICE =====================
Calling `pod install` directly is deprecated in React Native
because we are moving away from Cocoapods toward alternative
solutions to build the project.
* If you are using Expo, please run:
`npx expo run:ios`
* If you are using the Community CLI, please run:
`yarn ios`
=============================================================
```

That's great except I don't seem to be using Yarn.

To do version revs, use Xcode or edit `project.pbxproj`.

`npx uri-scheme add tricordarr --ios`

## App Store Connect

Answers to the Local Push Connectivity entitlement request:

> Tricordarr is a messaging client for a bespoke service built for a week-long cruise event. The service runs on a server that is physically loaded on-board the ship during embarkation. Clients connect to the server via ship wifi to interact with the API. Local Push Connectivity allows background websocket connections to receive push notifications in this no internet environment.

> The ship has very limited internet capabilities by nature of being at sea. General Internet access is only available through purchase with the cruise line. The service this app connects to is physically located on-board the ship for the event. Access to APNS by the server and clients is not available.

> Both the server and the client app (this app) are located on a cruise ship at sea without access to the internet.

## Scene lifecycle (iOS 27)

The iOS 27 SDK requires the UIScene lifecycle; an app that has not adopted it traps at launch
(`___UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption_block_invoke`). We use Expo's scene
infrastructure, following the "hand-managed iOS project" section of
https://github.com/expo/fyi/blob/main/ios-scene-lifecycle.md:

- `ios/Tricordarr/SceneDelegate.swift` subclasses `ExpoAppSceneDelegate`, which creates the window and starts
  React Native. `Info.plist` points `UISceneDelegateClassName` at `$(PRODUCT_MODULE_NAME).SceneDelegate`.
- `AppDelegate` conforms to `ExpoReactNativeFactoryProvider` and no longer creates the window. URL, universal
  link and foreground/background events reach it through Expo's scene forwarding, so it has no `open url` or
  `continue userActivity` overrides.
- Do not import `<RCTAppDelegate.h>` in `Tricordarr-Bridging-Header.h`. With Xcode 27 and Expo SDK 58 it
  breaks `AppDelegate`'s conformance to `ExpoReactNativeFactoryProvider` ("requirements that could not be
  loaded in Swift 5.10").
