import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useEventCacheReducer} from '#src/Hooks/Events/useEventCacheReducer';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {EventsUpdateData, EventUpdateDifferenceData, EventUpdateLogData} from '#src/Structs/AdminControllerStructs';

export const useScheduleUploadMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async (data: EventsUpdateData) => {
    return await apiPost('/admin/schedule/update', data);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      // The upload only stages the .ics data; the server computes the diff shown by
      // /admin/schedule/verify separately, so there's no local data to apply -- refetch it.
      EventUpdateDifferenceData.getCacheKeys().forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};

export interface ScheduleApplyProps {
  forumPosts?: boolean;
  processDeletes?: boolean;
}

export const useScheduleApplyMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();
  const {removeEvent, updateEvent} = useEventCacheReducer();

  const mutationFn = async ({forumPosts, processDeletes}: ScheduleApplyProps) => {
    const params = new URLSearchParams();
    if (forumPosts) {
      params.set('forumPosts', 'true');
    }
    if (processDeletes) {
      params.set('processDeletes', 'true');
    }
    const query = params.toString();
    const url = query ? `/admin/schedule/update/apply?${params.toString()}` : '/admin/schedule/update/apply';
    return await apiPost(url);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      // The diff being applied is already sitting in the /admin/schedule/verify cache (the
      // admin had to fetch it to see what they were approving), so mutate the /events caches
      // directly with it instead of blindly invalidating everything.
      const diff = queryClient.getQueriesData<EventUpdateDifferenceData>({
        queryKey: ['/admin/schedule/verify'],
      })[0]?.[1];

      if (diff) {
        // Deletions and pure content edits don't change which filtered/paginated /events
        // query an event belongs to, so they can always be applied locally.
        diff.deletedEvents.forEach(event => removeEvent(event.eventID));
        diff.minorChangeEvents.forEach(updateEvent);

        // Created events, and events whose time or location changed, may move into or out of
        // cruiseday/location-filtered /events queries in ways we can't safely reconstruct
        // client-side -- fall back to invalidation for just those.
        if (diff.createdEvents.length || diff.timeChangeEvents.length || diff.locationChangeEvents.length) {
          queryClient.invalidateQueries({queryKey: ['/events']});
        }
      } else {
        queryClient.invalidateQueries({queryKey: ['/events']});
      }

      // The applied diff is now stale and a new log entry exists -- these aren't Event
      // caches, they're the diff/log views themselves, so they still need a refetch.
      EventUpdateDifferenceData.getCacheKeys()
        .concat(EventUpdateLogData.getCacheKeys())
        .forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};

export const useScheduleReloadMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async () => {
    return await apiPost('/admin/schedule/reload');
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      // Reload re-syncs the entire schedule from Sched with no diff returned, so there's
      // nothing for the reducer to apply locally -- a full refetch is the only option.
      EventUpdateLogData.getCacheKeys()
        .concat([['/events']])
        .forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};
