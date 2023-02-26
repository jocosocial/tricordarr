Websocket/Connection
* if on ship wifi reconnect more aggressively
* https://www.w3.org/Bugs/Public/show_bug.cgi?id=13104
* Calculate setting for websocket notification url. Consider onupdate callback in settings to trigger revalc
* Add last healthcheck date. Store that somewhere

App Structure
* Functional only components. Maybe a provider? Something that has no UI but is still present to trigger
  all the backend and setup stuff
* Renderless Components!
* more typescript conversion
* Consider provider/context for server URL and any settings.

Permissions
* Notifications switch to dialog if granted. Maybe bring back the page with explainer text.
* If you deny perms the first time you can't enable it on next run. For any permission too

API Interaction
* Use username from api response
* something around whoami or take me to the message or something.

UI/UX
* https://callstack.github.io/react-native-paper/docs/guides/theming-with-react-navigation

Work Queue
* onmessage trigger after login doesnt work
* wifi override switch
* Instructions
* Snackbar warning/error handling.
