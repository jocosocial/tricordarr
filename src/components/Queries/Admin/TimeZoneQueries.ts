import {TimeZoneChangeData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useOpenQuery} from '../OpenQuery.ts';

export const useTimeZoneChangesQuery = () => {
  return useOpenQuery<TimeZoneChangeData>('/admin/timezonechanges');
};
