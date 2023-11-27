import {useTokenAuthQuery} from '../TokenAuthQuery';
import {ForumData} from '../../../libraries/Structs/ControllerStructs';

export const useForumPostForumQuery = (postID: string) => {
  return useTokenAuthQuery<ForumData>({
    queryKey: [`/forum/post/${postID}/forum`],
  });
};
