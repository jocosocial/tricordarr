import {TimeZoneChangeData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useOpenQuery} from '#src/Queries/OpenQuery.ts';

export const useTimeZoneChangesQuery = () => {
  return useOpenQuery<TimeZoneChangeData>('/admin/timezonechanges');
};
