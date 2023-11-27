import {useTokenAuthPaginationQuery} from '../TokenAuthQuery';
import {ForumData} from '../../../libraries/Structs/ControllerStructs';

export const useForumSearchQuery = (forumID: string) => {
  return useTokenAuthPaginationQuery<ForumData>(`/forum/${forumID}`, [`/forum/${forumID}`], 50);
};
