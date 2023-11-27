import {AnnouncementData} from '../../../libraries/Structs/ControllerStructs';
import {useOpenQuery} from '../OpenQuery';

export const useAnnouncementsQuery = () => {
  return useOpenQuery<AnnouncementData[]>({
    queryKey: ['/notification/announcements'],
  });
};
