import {AnnouncementData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useAnnouncementsQuery = (options = {}) => {
  return useTokenAuthQuery<AnnouncementData[]>('/notification/announcements', {
    ...options,
  });
};
