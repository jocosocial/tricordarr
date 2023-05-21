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
* nbsp after AppIcon for spacing is haxxxx
* Moving the blocks/mutes Menu.Item's to dedicated components broke providers. why?
* Logout should default to clearData, if user opts for all sessions then hit API 
* global settings for websocket and fezsocket enable/disable
* What to do about notifee notifications for a seamail that you have open and focused.
* Websocket construction needs generics that don't automatically notify
* Seamail tap and hold menu needs to render above bottom nav
* After you've posted as twitarrteam/moderator, go back screen to previous state. factor in coming in as mod/team

Work Queue
* fix the initial login userID undefined bug
* Bottom Tabs: Today, Chat, Forums, Calendar, LFG???
* logout option for all sessions
*  The 'navigation' object hasn't been initialized yet. This might happen if you don't have a navigator mounted, or if the navigator hasn't finished mounting. 
  * Happens on tapping a foreground notification
* Rendering relations provider too many times which likely means something else is whack
