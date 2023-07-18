Backlog
* blocks/mutes/favorites refetch doesnt update when the server changed
* load blocks/mutes/favorites some other time
* Find a way to make tokenAuthQuery do the onError processing.
* timezone warnings

Work Queue
* Themes
  * refresh of /dailythemes is not updating
  * it likely thinks the cruiseDayIndex is wrong
  * 1AM is the 1 hour difference between EST and EDT
  * didnt even call the refresh when the cron fired?
  * figure out what specifically rerenders on the hourly clock
* notification socket control not working.
* first login not generating fgs?
* move undrefetch out of the mainimagecardcover. it should be in the provider.
