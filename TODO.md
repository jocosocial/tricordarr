Websocket/Connection
* if on ship wifi reconnect more aggressively
* if not on ship wifi pause
* https://github.com/websockets/ws/#how-to-detect-and-close-broken-connections
* https://www.w3.org/Bugs/Public/show_bug.cgi?id=13104
* Exponential back off retry generic
* Calculate setting for websocket notification url. Consider onupdate callback in settings to trigger revalc

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
* See if making dark mode is easy

Work Queue
* Decode messages as enum
* Consider provider/context for server URL.
* Expand user context to more details.
* Backoff https://www.npmjs.com/package/exponential-backoff