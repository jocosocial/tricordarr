Tricordarr
----------
* Mute is taking a moment to re sort
* Add ascending descending sort options. Divider in menu then new options
* event search is missing the important part
* make generic `apiQueryV3()` and audit uses of raw `useQuery()`
* Improve changing server url behavior - 404's and 400's.
* since selection is now a provider, prevent re-rendering the entire flatlist for each selection instead
  * performance on real device is a bit less ideal
* update selection data on mutation rather than through useEffect
* Chall fixed an endpoint to have pagination. Consume it.
* Generic for TQueryParams
* Are pagination start and limit in the key?

Swiftarr
--------
* Mute Privileged seamail mutes for everyone. Call this out somewhere
