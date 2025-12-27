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
