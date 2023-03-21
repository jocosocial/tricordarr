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

UI/UX
* https://callstack.github.io/react-native-paper/docs/guides/theming-with-react-navigation
* Help modal provider

Work Queue
