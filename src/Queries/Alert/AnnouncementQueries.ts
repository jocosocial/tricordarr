import {AnnouncementData} from '#src/Structs/ControllerStructs';
import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';

export const useAnnouncementsQuery = (options = {}) => {
  return useTokenAuthQuery<AnnouncementData[]>('/notification/announcements', {
    ...options,
  });
};
