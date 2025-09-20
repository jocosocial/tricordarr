import {TimeZoneChangeData} from '#src/Structs/ControllerStructs';
import {useOpenQuery} from '#src/Queries/OpenQuery';

export const useTimeZoneChangesQuery = () => {
  return useOpenQuery<TimeZoneChangeData>('/admin/timezonechanges');
};
