import {useOpenQuery} from '#src/Queries/OpenQuery';
import {TimeZoneChangeData} from '#src/Structs/ControllerStructs';

export const useTimeZoneChangesQuery = () => {
  return useOpenQuery<TimeZoneChangeData>('/admin/timezonechanges');
};
