import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {EventsUpdateData, EventUpdateDifferenceData, EventUpdateLogData} from '#src/Structs/AdminControllerStructs';
import {EventData} from '#src/Structs/ControllerStructs';

export const useScheduleUploadMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async (data: EventsUpdateData) => {
    return await apiPost('/admin/schedule/update', data);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
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
      EventUpdateDifferenceData.getCacheKeys()
        .concat(EventUpdateLogData.getCacheKeys())
        .concat(EventData.getCacheKeys())
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
      EventUpdateLogData.getCacheKeys()
        .concat(EventData.getCacheKeys())
        .forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};
