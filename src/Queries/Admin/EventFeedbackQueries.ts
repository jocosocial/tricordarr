import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {EventFeedbackReport, EventFeedbackStats} from '#src/Structs/ControllerStructs';

/**
 * Lists all shadow event feedback reports, newest update first.
 */
export const useEventFeedbackReportsQuery = (options = {}) => {
  return useTokenAuthQuery<EventFeedbackReport[]>('/admin/feedback/reports', options);
};

/**
 * Shadow event and feedback response statistics for the admin reports page.
 */
export const useEventFeedbackStatsQuery = (options = {}) => {
  return useTokenAuthQuery<EventFeedbackStats>('/admin/feedback/stats', options);
};

/**
 * A single feedback report by database ID.
 */
export const useEventFeedbackReportQuery = ({feedbackID}: {feedbackID: string}, options = {}) => {
  return useTokenAuthQuery<EventFeedbackReport>(`/admin/feedback/report/${feedbackID}`, options);
};
