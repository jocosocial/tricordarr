import {STALE} from '#src/Libraries/Time/Time';
import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {DailyThemeData} from '#src/Structs/ControllerStructs';

export const useDailyThemeQuery = (options = {}) => {
  return useTokenAuthQuery<DailyThemeData[]>('/notification/dailythemes', {
    staleTime: STALE.HOURS.TWENTY_FOUR,
    ...options,
  });
};
