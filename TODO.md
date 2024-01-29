Backlog
* Consider prototyping usersettings here. Store filter and sort preferences
  * Make contentsettibgs part of that - events and lfg

Work Queue

Nightly
* Move reload buttons into the actions menu like in events
* Don't render moderator card until we have the data

* State Issues
  * Pinning a post needs to invalidate the Forum query so that use effect doesn't rewrite local state
  * Shared forum post state gets weird when going deep in the navigation state. Maybe missing an is focused. Even reload didn't fix it
  * After favoriting a bunch of things, the your events filter doesn't honor them until reload
  * going back from forum to category triggers refresh
