import {TimeZoneChangeData} from '../../../libraries/Structs/ControllerStructs';
import {useOpenQuery} from '../OpenQuery.ts';

export const useTimeZoneChangesQuery = () => {
  return useOpenQuery<TimeZoneChangeData>('/admin/timezonechanges');
};
