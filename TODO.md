Backlog


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
  * Common open query function to hook into disable or not logged in
  * Show soon/now in favorites view and search results
  * Long press favorites should remove from favorites list
  * Long press in favorites toggle star
