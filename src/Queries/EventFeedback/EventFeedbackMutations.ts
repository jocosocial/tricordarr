import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {EventFeedbackData, EventFeedbackReport, EventFeedbackStats} from '#src/Structs/ControllerStructs';

/**
 * Creates or updates the current user's host feedback for an event.
 * POST `/api/v3/feedback`; uniqued per user+event.
 */
export const useEventFeedbackCreateMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async (feedbackData: EventFeedbackData) => {
    return await apiPost<void, EventFeedbackData>('/feedback', feedbackData);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, variables) => {
      EventFeedbackData.getCacheKeys(variables.eventUID)
        .concat(EventFeedbackReport.getCacheKeys())
        .concat(EventFeedbackStats.getCacheKeys())
        .forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};
