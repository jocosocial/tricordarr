import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {EventUpdateDifferenceData, EventUpdateLogData} from '#src/Structs/AdminControllerStructs';

export const useScheduleVerifyQuery = (options = {}) => {
  return useTokenAuthQuery<EventUpdateDifferenceData>('/admin/schedule/verify', options);
};

export const useScheduleLogQuery = (options = {}) => {
  return useTokenAuthQuery<EventUpdateLogData[]>('/admin/schedule/viewlog', options);
};

export const useScheduleLogEntryQuery = ({logID}: {logID: number}, options = {}) => {
  return useTokenAuthQuery<EventUpdateDifferenceData>(`/admin/schedule/viewlog/${logID}`, options);
};
