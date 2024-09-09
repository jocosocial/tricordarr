import {useTokenAuthQuery} from '../TokenAuthQuery';
import {PostDetailData} from '../../../libraries/Structs/ControllerStructs';

export const useForumPostQuery = (postID: string) => {
  return useTokenAuthQuery<PostDetailData>(`/forum/post/${postID}`);
};
