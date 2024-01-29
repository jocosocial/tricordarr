Backlog
* Consider prototyping usersettings here. Store filter and sort preferences
  * Make contentsettibgs part of that - events and lfg

Work Queue

Nightly
* Anything in the drawer needs to move to common. Including all of settings :(
  * access from any root screen of a tab

* State Issues
  * Forum mark as read is now happening all the time, regardless of whether its been read or not
    * pass in the entire ForumListData? Do a search or something in the ForumThreadScreenBase?
    * The latter would solve the case of coming in from a post.
    * generates lots of excess queries
  * Remove a bunch of the now useless isFocused calls

```
SMOOTH LIKE BUTTAH
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchPins()]);
    setRefreshing(false);
  };
  
  Dont need to key off of the various isRefetchings
  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />

```

We dont show the new banner in forums. Likely because of ForumData and ForumListData. Resolve this.
