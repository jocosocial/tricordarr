Login/Logout
* Logout should wipe all notifications
* Wipe all query cache too

Notifications
* connection notification should direct to connection settings. or instructions
* replace NotificationDataListener with notifee event driven system?

Websocket/Connection
* https://www.w3.org/Bugs/Public/show_bug.cgi?id=13104
* Calculate setting for websocket notification url. Consider onupdate callback in settings to trigger revalc
* Add last healthcheck date. Store that somewhere

App Structure
* more typescript conversion
* Consider provider/context for server URL and any settings.

UI/UX
* https://callstack.github.io/react-native-paper/docs/guides/theming-with-react-navigation

Work Queue
* TEST AND RELEASE!
* If the connection is broken it doesnt attempt to restart it. Only reconnect initially.
  mark seamails as read button
  switch to turn off polling
  consider disabling polling
  Help modal provider
  Do a cron post test
  Tell user to change battery settings to performance
  Healthcheck date
  Consider a button to reset the websocket?
  Disable vibration on socket start 
