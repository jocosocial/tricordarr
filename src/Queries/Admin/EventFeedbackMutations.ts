import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {EventFeedbackReport} from '#src/Structs/ControllerStructs';

interface EventFeedbackMarkProps {
  feedbackID: string;
  actionable: boolean;
}

/**
 * Marks or clears the actionable flag on a feedback report.
 * POST `/admin/feedback/report/:id/mark` to set, DELETE to clear.
 */
export const useEventFeedbackMarkMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async ({feedbackID, actionable}: EventFeedbackMarkProps) => {
    if (actionable) {
      return await apiPost(`/admin/feedback/report/${feedbackID}/mark`);
    }
    return await apiDelete(`/admin/feedback/report/${feedbackID}/mark`);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, variables) => {
      EventFeedbackReport.getCacheKeys(variables.feedbackID).forEach(key =>
        queryClient.invalidateQueries({queryKey: key}),
      );
    },
  });
};

/**
 * Fetches all feedback reports for client-side CSV generation. There is no download API.
 */
export const useEventFeedbackDownloadMutation = () => {
  const {apiGet} = useSwiftarrQueryClient();

  const mutationFn = async () => {
    const response = await apiGet<EventFeedbackReport[]>('/admin/feedback/reports');
    return response.data;
  };

  return useTokenAuthMutation(mutationFn);
};
