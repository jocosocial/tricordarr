import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {DailyThemeData} from '#src/Structs/ControllerStructs';

export const useDailyThemeQuery = (options = {}) => {
  return useTokenAuthQuery<DailyThemeData[]>('/notification/dailythemes', {
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};
