Login/Logout
* Logout should wipe all notifications
* Wipe all query cache too

Notifications
* connection notification should direct to connection settings. or instructions
* replace NotificationDataListener with notifee event driven system?
* Consider killing the polling.
* "kate" mode - no push display notifications. in-app only.

Websocket/Connection
* https://www.w3.org/Bugs/Public/show_bug.cgi?id=13104
* Calculate setting for websocket notification url. Consider onupdate callback in settings to trigger revalc
* Changing server URL should trigger something or yell at you to restart.

App Structure
* more typescript conversion
* Consider provider/context for server URL and any settings.
* Better way to manage settings descriptions/titles for less useEffect and more compatibility with deep linking.
* Improve navigation with deep linked screens (non-twitarr content).
* Unified form handling props (LoginForm and SettingForm).
* bottomtabnavigator screens should be dynamically generated.

UI/UX
* https://callstack.github.io/react-native-paper/docs/guides/theming-with-react-navigation
* Help modal provider

Questions for Ben
* redux traps, gotchas
* left function callback warning about re-defining component
* wtf https://stackoverflow.com/questions/17380845/how-do-i-convert-a-string-to-enum-in-typescript

Work Queue
* Do the type thingies for all stack navigators
* JSX.Element array vs single for all high level containers
* TSX validation
* duplicating types everywhere
* read https://reactnavigation.org/docs/typescript
* PropsWithChildren, https://blog.logrocket.com/using-react-children-prop-with-typescript/
* Remove `any` type usage
