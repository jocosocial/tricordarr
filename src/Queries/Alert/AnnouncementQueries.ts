import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {AnnouncementData} from '#src/Structs/ControllerStructs';

export const useAnnouncementsQuery = (options = {}) => {
  return useTokenAuthQuery<AnnouncementData[]>('/notification/announcements', {
    ...options,
  });
};
