import {TokenAuthQueryOptionsType, useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {EventFeedbackReport, EventFeedbackSelectionData} from '#src/Structs/ControllerStructs';

interface EventListQueryParams {
  room?: string;
}

/**
 * Eligible shadow/workshop events the current user can report on.
 * Optional `room` fills `matchingRoom` via a location prefix filter.
 */
export const useEventFeedbackEventListQuery = (
  room?: string,
  options: TokenAuthQueryOptionsType<EventFeedbackSelectionData> = {},
) => {
  const queryParams: EventListQueryParams | undefined = room ? {room} : undefined;
  return useTokenAuthQuery<EventFeedbackSelectionData>('/feedback/eventlist', options, queryParams);
};

/**
 * Existing feedback for the current user by Sched ICS UID, or an empty prefilled report.
 */
export const useEventFeedbackByUidQuery = (
  {eventUID}: {eventUID: string},
  options: TokenAuthQueryOptionsType<EventFeedbackReport> = {},
) => {
  return useTokenAuthQuery<EventFeedbackReport>(`/feedback/uid/${encodeURIComponent(eventUID)}`, options);
};

/**
 * Existing feedback for the current user by Twitarr event ID. 204 when none exists.
 */
export const useEventFeedbackByIdQuery = (
  {eventID}: {eventID: string},
  options: TokenAuthQueryOptionsType<EventFeedbackReport> = {},
) => {
  return useTokenAuthQuery<EventFeedbackReport>(`/feedback/id/${eventID}`, options);
};
