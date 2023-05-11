Questions for Ben
* None!

Backlog
* seamailstack is technically chatstack
* replace server connection boolean settings with the new components.
* maybe all settings for that matter?
* FAB drawing on top of snack bar
* consider replacing ScrollView lists with FlatView or at least using the Separators feature?
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
* deprecate the privilege stuff in userdataprovider
* After you've posted as twitarrteam/moderator, go back screen to previous state. factor in coming in as mod/team

Work Queue
* Seamail
  * List
    * Seamail search
    * Paginate
  * Viewing (pagination)
    * start at unread, start at top of converstation
    * refetch fetching all once caching is enabled?
    * "new" separator
    * Participant change messages.
    * The red is very bright. Maybe move to a themed thing
    * loading from socket unreliable on first load?
  * Deep link to seamail from notifications
* fix the initial login userID undefined bug
* Bottom Tabs: Today, Chat, Forums, Calendar, LFG???

Websocket States
0: 'Connecting',
1: 'Open',
2: 'Closing',
3: 'Closed',
