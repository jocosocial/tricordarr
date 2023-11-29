Backlog
* user quarantine

Work Queue
* consistent forum icons
* Thread View
  * Edit
* thread posts
  * rename favorite posts to bookmarked posts? not consistent with site UI
  * post actions menu
    * Favorite
      * updating real but not udating state
    * edit
    * delete
  * Consider setting title? No idea what thread I'm in.
    * onPress => modal of title?
    * or a ForumDetailsScreen with basic information from ForumData
  * Mentions
    * containingpost thread link - navigate to the thread but with different start data
    * remove the invert
  * Figure out a place to put the favorite icon
* Thread Post Form
  * Same as Fez just with multiple image support
* Events
  * Jump to now doesnt seem to work if cruise is in the future but schedule is from the past

Nightly
* can't sign out if twitarr is down/404
* Long seamail title gets ugly on seamail screen
  * Doesn't render great in listitem either. Wrap?
* Turn off the raw time seamail thing
* Missing key in emoji viewer
* Close emoji viewer without selecting one - Makena good way to do that
* Header cruise index should follow real time not late day
* Nearly all of the nav gripes about back to home stack first are related to user profile.
* Ssl issues are a great way to test query network behavior and error handling
* thumbnail not honoring rotation? - self posts in beta
* Forum thread screen start at unread
* Unread marker in post flatlist
* Mark thread as read
* Does lfg list need pagination
* Non mods should not see lfg chat
* Shared thread list is buggy if screens background? I'm getting crossed data when changing the filter
* Perhaps add a is focused to the dispatch calls
* Debounce directory search
* Edit forum to the menu rather than button
* Moderators should still be able to post in forums. Add wording to the locked view
* The unfavorite icon is confusing. So is unmute. shoukd it be current state or action?
* mention auto complete
