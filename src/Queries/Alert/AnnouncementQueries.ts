import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {AnnouncementData} from '#src/Structs/ControllerStructs';

export const useAnnouncementsQuery = (options = {}, includeInactives = false) => {
  return useTokenAuthQuery<AnnouncementData[]>(
    '/notification/announcements',
    options,
    includeInactives ? {inactives: 'true'} : undefined,
  );
};
