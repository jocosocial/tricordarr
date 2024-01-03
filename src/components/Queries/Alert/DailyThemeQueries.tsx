import {DailyThemeData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useDailyThemeQuery = (options = {}) => {
  return useTokenAuthQuery<DailyThemeData[]>({
    queryKey: ['/notification/dailythemes'],
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};
