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
* Forum via Webview with deep linking

Work Queue
* Event
  * No way to view entire week of your favorite only events. <-- further case for moving LFGs out.
  * favoriting an event doesnt regenerate the list with fresh data
  * Changes in the ScheduleProvider LFGs likely cause rerendering of events <-- further case 
* LFG features
  * Create
  * View
    * context, actions, chat
  * Actions
    * Update
* Schedule
  * Ok yeah kill the ScheduleItem concept. Need badge for LFGs in card.
  * Checking unchecking filters is super slow. Perhaps rerendering the entire list isn't so good. Make it conditional instead
* Nightly
  * My lfg for Saturday noon is missing from day view
    * Missing from the site UI too. WTF
    * The API call filters Fez's that you are a part of. So either we need a URL param to include those or two calls
    * to load the schedule, joined and open.
  * Entire card touchable ripple
  * chat is leaking requests - each time it adds an extra GET
  * Might need some shared state of lfglist (like the fezlist context in the TwitarrProvider)
  * Participant changes need to trigger loading
  * What does minimum do?
