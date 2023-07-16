import {AnnouncementData, DailyThemeData} from '../../../libraries/Structs/ControllerStructs';
import {useQuery} from '@tanstack/react-query';

export const useDailyThemeQuery = () => {
  return useQuery<DailyThemeData[]>({
    queryKey: ['/notification/dailythemes'],
  });
};
