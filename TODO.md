Backlog

Work Queue
* thread list
  * pagination query
  * sorting
  * filter
  * help
  * reducer for the forum thread list
  * Thread flatlist
  * show event time if exists
  * locked
* consistent forum icons
* thread posts
  * image gallery
  * refresh button, or make the refreshcontrol not as sensitive. had trouble with scrolling vs refresh.
  * add "this is the start of this forum"
  * Buttons: Event|Edit/Favorite/Mute Menu:Report/Mod/Help thread
  * post actions menu: Favorite/Report/Mod + Reactions
  * Show reactions
  * Consider setting title? No idea what thread I'm in.
    * onPress => modal of title?
    * or a ForumDetailsScreen with basic information from ForumData
  * Mentions
    * containingpost thread link - navigate to the thread but with different start data
* Thread Post Form
  * Same as Fez just with multiple image support
* Search Threads
* Search Posts
* Have search be context-aware? Navigate you to search page with some options pre-specified
  based on the route that you came from?

Nightly
* changing server url before re-signin:
  * main screen still has stale data
  * Refetch yelling
  * not using my custom CA
* can't sign out if twitarr is down/404
