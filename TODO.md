Questions for Ben
* None!

Backlog
* duplicating types everywhere
* Do the type thingies for all stack navigators
* Enum or something the various navcomponents
* useNavStack to replace the any's (like Seamail and user profile)
* seamailstack is technically chatstack
* replace server connection boolean settings with the new components.
* maybe all settings for that matter?
* FAB drawing on top of snack bar
* consider replacing ScrollView lists with FlatView or at least using the Separators feature?
* Go back and adjust settings stack
* combine and rename SubmitIconButton and NavBarIconButton
* variablize the initial source userheader, change with buttons, combine with destination userheader
* make modal cover the nav bars. organizing the App.tsx provider hell is problematic.
* default mutation error handling isnt working. Likely getting overridden.
* nbsp after AppIcon for spacing is haxxxx
* Moving the blocks/mutes Menu.Item's to dedicated components broke providers. why?
* Logout should default to clearData, if user opts for all sessions then hit API 

Work Queue
* Seamail
  * List
    * Seamail search
  * Viewing (pagination)
    * start at unread, start at top of converstation
    * refetch fetching all once caching is enabled?
    * "new" separator
    * pushPostToScreen
    * Append FezPost from Socket if it didn't come through the form (uc: post from browser)
    * Participant change messages. What happens if this occurs?
    * The red is very bright. Maybe move to a themed thing
  * Details
    * Modify participants needs to refresh the list
  * Deep link to seamail from notifications
  * Posting
    * How or where to change if youre posting as TwitarrTeam/Moderator
* fix the initial login userID undefined bug
* Bottom Tabs: Today, Chat, Forums, Calendar, LFG???

Websocket States
0: 'Connecting',
1: 'Open',
2: 'Closing',
3: 'Closed',
