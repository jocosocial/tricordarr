Questions for Ben
* wtf https://stackoverflow.com/questions/17380845/how-do-i-convert-a-string-to-enum-in-typescript
* react query useThing mutation component. something about this rings a bell

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

Work Queue
* unified screenOptions across all stacks
* New pattern for stack navigators starts with seamail
* Seamail
  * New
    * Formik is rerendering on each action of every field, even with fastfield
    * wire up the mutations
  * Viewing (pagination)
    * tap and hold message for actions. Details, Report, FUTURE USE: reactions
    * open socket and update content when message comes in
    * in chat details, expand description of type or add a help section
    * disable manage members for non-open/lfg fezs
    * add help to the three-dots menu in seamail
    * start at unread, start at top of converstation
    * refetch fetching all once caching is enabled?
    * "new" separator
* fix the initial login userID undefined bug
* Profile
  * block/report/mute modal.
  * welcome message needs top padding after all. Not much but some
  * private note should be a different color
* Props types PropsWithUserHeader
* rename NavBarIcon
* rename SubmitIconButton
