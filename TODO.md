Backlog
* blocks/mutes/favorites refetch doesnt update when the server changed
* load blocks/mutes/favorites some other time
* Find a way to make tokenAuthQuery do the onError processing.
* timezone warnings
* Pressing PrimaryActionButton dismisses keyboard but doesnt actually press - highlight unsaved work
* Big red exclamation thing with server healthcheck failure
* private note feature missing
* Notifications
  * notification socket control not working.
  * enableusernotificatoins is a bad pattern, what does it mean?
* Oobe
  * add notification preferences to oobe flow
* Setting for theme. Light, dark, use system.
* Make a new base FAB
* Your next event card on main screen
* The menu system could use some deduplication
* scrollToNow() should go to the first index of any other events at that time, rather than $next-1
* Forum via Webview with deep linking
* leaking lfg fez socket if chat screen is opened then closed.


Work Queue
* LFG features
  * Create
  * View
    * context, actions, chat
  * Actions
    * Update
* Nightly
  * chat is leaking requests - each time it adds an extra GET
  * Might need some shared state of lfglist (like the fezlist context in the TwitarrProvider)
  * Near 1am on Friday with late disabled, now went to 1pm on Friday.
  * Something definitely wrong with the main title header picture. Stopped rendering late night st one point. Maybe I have a math problem?
    * Might be a React Development thing - if the app is disconnected from the debugger?
  * Generic FlatList for LFGs / Events broken by day instead of hour
  * show schedule but disable lfg queries if not logged in
  * Add an oobe bypass secret switchFilter now and soon events
  * Filter menu design for smaller screens
  * Lfg navigator stuck after tapping an lfg in the schedule view if nav is not initialized first
  * Common open query function to hook into disable or not logged in
