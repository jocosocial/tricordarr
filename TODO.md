Questions for Ben
* react query useThing mutation component. something about this rings a bell
* formik rerender performance. memoize?

Backlog
* duplicating types everywhere
* Do the type thingies for all stack navigators
* Enum or something the various navcomponents
* useNavStack to replace the any's (like Seamail and user profile)
* seamailstack is technically chatstack
* replace server connection boolean settings with the new components.
* maybe all settings for that matter?
* proper error handling for axios errors
* FAB drawing on top of snack bar
* consider replacing ScrollView lists with FlatView or at least using the Separators feature?
* Go back and adjust settings stack
* combine and rename SubmitIconButton and NavBarIconButton
* variablize the initial source userheader, change with buttons, combine with destination userheader
* make modal cover the nav bars. organizing the App.tsx provider hell is problematic.
* implement registration code view
* default mutation error handling isnt working. Likely getting overridden.
* alt accounts affect wording for blocks/mutes.
* nbsp after AppIcon for spacing is haxxxx
* Moving the blocks/mutes Menu.Item's to dedicated components broke providers. why?
* screen for blocks/mutes/favorites
* edit profile
* alert/mute keywords
* alt accounts
* change password

Work Queue
* Seamail
  * List
    * Implement the forUser buttons
      * when switched to a privileged forUser, change FAB color
    * Seamail search
    * Websocket useNotifivationSocket for refreshing the seamail list view
    * buzz on socket receive (may need to figure this out with notifications)
  * New
    * Going "back" needs to add the new conversation to the list
    * focus on subject or message should clear search
  * Viewing (pagination)
    * tap and hold message for actions. Details, Report, FUTURE USE: reactions
      * report content modal same as profile
    * open socket and update content when message comes in
    * add help to the three-dots menu in seamail
    * start at unread, start at top of converstation
    * refetch fetching all once caching is enabled?
    * "new" separator
    * twitarrteam and moderator
    * Websocket useFezSocket for seamail post updating
    * Title bar indicator for socket status
    * buzz on socket receive (may need to figure this out with notifications)
  * Details
    * in chat details, expand description of type or add a help section
    * manage members
    * disable manage members for non-open/lfg fezs
    * title selectable
  * Deep link to seamail from notifications
* fix the initial login userID undefined bug
* Profile
  * hold to copy
* Bottom Tabs: Today, Chat, Forums, Calendar, LFG???
