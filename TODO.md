Questions for Ben
* None!

Backlog
* seamailstack is technically chatstack
* FAB drawing on top of snack bar
* combine and rename SubmitIconButton and NavBarIconButton
* make modal cover the nav bars. organizing the App.tsx provider hell is problematic.
* default mutation error handling isnt working. Likely getting overridden.
  * Might have figured this out if options are passed in to the hook.
* nbsp after AppIcon for spacing is haxxxx
* Moving the blocks/mutes Menu.Item's to dedicated components broke providers. why?
* Seamail tap and hold menu needs to render above bottom nav
* After you've posted as twitarrteam/moderator, go back screen to previous state. factor in coming in as mod/team
* notification rate limiting

Work Queue
* Bottom Tabs: Today, Chat, Forums, Calendar, LFG???
* Settings
  * replace server connection boolean settings with the new components.
* Sockets
  * Socket stuff really needs cleaned up. Shared socket, notificationsocket only for notifee?
  * Switch FGS socket to use notificationsocket
* Notifications
  * Move the FGS stuff to use the new providers. Watch out for doubling
  * NotificationType vs NotificationTypeData
  * Dont notifee if the seamail is the active route
* Seamail
  * New messages are very slow to show up on SeamailScreen after notification event
