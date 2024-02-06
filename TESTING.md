Testing
=======

I really should make some automated tests some day...

Cases
-----

### Account
#### Registration
* Create account
* Login
* Forgot password

#### Self Profile
* Edit
* Upload Photo
* delete photo
* change photo
* profile link to forums
* profile link to forum posts for moderators

#### Manage
* change username
* change password
* logout device
* logout all

### Drawer
* directory search

#### User Profile
* view
* favorite / unfavorite
* create private note
* edit private note
* delete private note
* block / unblock
* mute / unmute
* report
* start seamail with user

#### Navigation
* board games
* karaoke
* lighter
* themes
  * view theme
* deck map
  * change decks
* time zone check
* FAQ
* Code of Conduct
* About Twitarr
* About Tricordarr
* Web UI

### Today Screen
* Account Management (see actions above)
* Theme card view theme
* Announcement
* Next event if present
  * tap opens event

### Settings
* Your account (same as above)
* server url
  * healthcheck
  * change signs you out
* change push notifications
  * enable / disable all
* background worker
  * enable / disable
  * start/stop
  * change healthcheck interval
* polling
  * enable / disable
  * change poll interval
* content
<!-- Pick it up here -->

### Forums
* Mentioned notification opens the mentions page and clears the unread

### Schedule
* favorite event (should also update UND)
* unfavorite event (should also update UND)

### Socket Events
* new announcement generates notification
  * tapping notification opens home screen with announcement
