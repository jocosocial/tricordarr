import {DailyThemeData} from '../../../libraries/Structs/ControllerStructs';
import {useOpenQuery} from '../OpenQuery';

export const useDailyThemeQuery = () => {
  return useOpenQuery<DailyThemeData[]>({
    queryKey: ['/notification/dailythemes'],
  });
};
