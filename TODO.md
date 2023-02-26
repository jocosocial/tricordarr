Websocket/Connection
* if on ship wifi reconnect more aggressively
* if not on ship wifi pause
* https://github.com/websockets/ws/#how-to-detect-and-close-broken-connections
* https://www.w3.org/Bugs/Public/show_bug.cgi?id=13104
* Calculate setting for websocket notification url. Consider onupdate callback in settings to trigger revalc
* FGS should not run at all unless on specified wifi networks or with a toggle
* Add last healthcheck date. Store that somewhere

App Structure
* Functional only components. Maybe a provider? Something that has no UI but is still present to trigger
  all the backend and setup stuff
* Renderless Components!
* more typescript conversion

Permissions
* Notifications switch to dialog if granted. Maybe bring back the page with explainer text.
* If you deny perms the first time you can't enable it on next run. For any permission too

API Interaction
* Use username from api response
* something around whoami or take me to the message or something.

UI/UX
* https://callstack.github.io/react-native-paper/docs/guides/theming-with-react-navigation

Work Queue
* Permissions
* Decode messages as enum
* Consider provider/context for server URL and any settings.
* Expand user context to more details.
* Snackbar warning/error handling.
* Fresh installation - permissions issue via dustin?
