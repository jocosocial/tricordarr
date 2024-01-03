import {AnnouncementData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useAnnouncementsQuery = (options = {}) => {
  return useTokenAuthQuery<AnnouncementData[]>({
    queryKey: ['/notification/announcements'],
    staleTime: 1000 * 60,
    ...options,
  });
};
