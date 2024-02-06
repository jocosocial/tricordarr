Backlog
* Consider prototyping usersettings here. Store filter and sort preferences
  * Make contentsettibgs part of that - events and lfg
* Swiftarr doesnt display the new marker for forums.
  * I'm somewhat cheating this by passing in the ForumListData from the item.
  * We don't have access to that from other flows.
* Drawer can only call linking. No navigation available. Is there a way?
* Kill enableUserNotifications. It can be easily replaced elsewhere
* blocking a user 404's their profile. respond to that better
* announcements, themes, and schedule dont need an account

Work Queue

Nightly
* new announcement doesnt refetch announcements when app launches from background
  * probably need to if visible refetch
