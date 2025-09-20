import {DailyThemeData} from '#src/Structs/ControllerStructs';
import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';

export const useDailyThemeQuery = (options = {}) => {
  return useTokenAuthQuery<DailyThemeData[]>('/notification/dailythemes', {
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};
