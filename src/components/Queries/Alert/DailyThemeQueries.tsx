import {DailyThemeData} from '../../../libraries/Structs/ControllerStructs';
import {useOpenQuery} from '../OpenQuery';

export const useDailyThemeQuery = (options = {}) => {
  return useOpenQuery<DailyThemeData[]>({
    queryKey: ['/notification/dailythemes'],
    // staleTime: 1000 * 60 * 5,
    ...options,
  });
};
