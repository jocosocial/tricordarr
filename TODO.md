Backlog
* user quarantine
* Events
  * Jump to now doesnt seem to work if cruise is in the future but schedule is from the past
* Query last fetched at?
* Directory
  * Debounce directory search

Work Queue
* ErrorBanner
  * onPress settings needs to dismiss
* Snackbars linger a lot
* Forum
  * Forum thread screen start at unread
  * Unread marker in post flatlist
  * Mark thread as read (dispatch)
  * mention auto complete
  * Forum flatlist scroll button with post form
    * Scroll down button needs better spacing with post view too
  * No post in locked
  * Tap post jump to thread (noop on regular view), long press for details
  * Disable mute / favorite if favorites / muted (mutual exclusivity)
  * Flatlist loadNext/loadPrevious offset (or indicator of more/previous posts) so user knows the end is not the end
  * missing a key in forum thread view with images added. Probably with the new element
  * maybe add chars lines after all? Bottom in small text
  * how to get from a thread list starting st a specific post to the full thread? Button in the list header? Tap the title view?

Nightly
* emoji picker and insert menu for forum post. Consider using the full post form and displaying the current post above?
* image snack bar needs raised above the footer because z index is wrong
* do not show "start of lfg" if hasneztpage
* lfg card really needs to go back to the event day screen
* measure power consumption https://www.npmjs.com/package/@welldone-software/why-did-you-render
* account avatar button on main screen in top right corner. Do account switching (far future), manage account, etc.
* moderator trunk notification badges
  * admin too
