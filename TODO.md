Backlog
* blocks/mutes/favorites refetch doesnt update when the server changed
* load blocks/mutes/favorites some other time
* Find a way to make tokenAuthQuery do the onError processing.
* timezone warnings
* Pressing PrimaryActionButton dismisses keyboard but doesnt actually press - highlight unsaved work
* Big red exclamation thing with server healthcheck failure
* Note about username case sensitivity
* private note feature missing
* Notifications
  * notification socket control not working.
  * first login not generating fgs?
  * enableusernotificatoins is a bad pattern, what does it mean?
* Oobe
  * add notification preferences to oobe flow
* Setting for theme. Light, dark, use system.
* Make a new base FAB
* Your next event card on main screen
* pressing a bottomtab button again shoudl take you to the root of that stack.
* The menu system could use some deduplication
* scrollToNow() should go to the first index of any other events at that time, rather than $next-1
* Linking - Fez chat to Seamail screen, back goes to seamail list not to Fez

Work Queue
* Forum via Webview with deep linking
* LFG features
  * Create
  * View
    * context, actions, chat
  * Actions
    * Canceled
    * Update
* Schedule
  * Ok yeah kill the ScheduleItem concept. Need badge for LFGs in card.
  * Checking unchecking filters is super slow. Perhaps rerendering the entire list isn't so good. Make it conditional instead
  * show favorite star in badge position of event card
* Nightly
  * My lfg for Saturday noon is missing from day view
  * Once again the header image stopped working
  * Entire card touchable ripple
  * Tap participation to open the manage screen, with participation management add/remove/waitlist
  * Add chat datafield to lfg with post count
  * Account remove instead of minus
  * Different frotnend routes for lfg/fez and seamail
