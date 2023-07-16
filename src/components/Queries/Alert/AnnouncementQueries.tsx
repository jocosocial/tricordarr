import {AnnouncementData} from '../../../libraries/Structs/ControllerStructs';
import {useQuery} from '@tanstack/react-query';

export const useAnnouncementsQuery = () => {
  return useQuery<AnnouncementData[]>({
    queryKey: ['/notification/announcements'],
  });
};
