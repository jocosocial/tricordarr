import {useTokenAuthQuery} from '../TokenAuthQuery';
import {ForumData, PostDetailData} from '../../../libraries/Structs/ControllerStructs';

export const useForumPostForumQuery = (postID: string) => {
  return useTokenAuthQuery<ForumData>({
    queryKey: [`/forum/post/${postID}/forum`],
  });
};

export const useForumPostQuery = (postID: string) => {
  return useTokenAuthQuery<PostDetailData>({
    queryKey: [`/forum/post/${postID}`],
  });
};
