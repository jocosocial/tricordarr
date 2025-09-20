import {DailyThemeData} from '../../../Libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useDailyThemeQuery = (options = {}) => {
  return useTokenAuthQuery<DailyThemeData[]>('/notification/dailythemes', {
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};
