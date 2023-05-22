Questions for Ben
* None!

Backlog
* seamailstack is technically chatstack
* replace server connection boolean settings with the new components.
* maybe all settings for that matter?
* FAB drawing on top of snack bar
* combine and rename SubmitIconButton and NavBarIconButton
* make modal cover the nav bars. organizing the App.tsx provider hell is problematic.
* default mutation error handling isnt working. Likely getting overridden.
  * Might have figured this out if options are passed in to the hook.
* nbsp after AppIcon for spacing is haxxxx
* Moving the blocks/mutes Menu.Item's to dedicated components broke providers. why?
* global settings for websocket and fezsocket enable/disable
* Websocket construction needs generics that don't automatically notify
* Seamail tap and hold menu needs to render above bottom nav
* After you've posted as twitarrteam/moderator, go back screen to previous state. factor in coming in as mod/team

Work Queue
* Bottom Tabs: Today, Chat, Forums, Calendar, LFG???
* User flips to unknown after login for a moment
* all needs to shoot any websockets
* cleanup settings, make a provider
* tab notifications should come from the socket provider not the background
* Consider throwing the user to their own profile after login. may avoid above issue.
* settings pages need some style cleanup
* Replace all color with error container to match. Post button and fab
* App start and notification socket event need to refresh notification data
* Self post on fez should update mod time on list
* Get mod and team notification badges 
* Mark as read should update notification data too
