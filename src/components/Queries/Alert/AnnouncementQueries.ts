import {AnnouncementData} from '../../../Libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useAnnouncementsQuery = (options = {}) => {
  return useTokenAuthQuery<AnnouncementData[]>('/notification/announcements', {
    ...options,
  });
};
