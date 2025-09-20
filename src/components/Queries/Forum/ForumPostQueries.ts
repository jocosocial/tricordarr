import {useTokenAuthQuery} from '../TokenAuthQuery';
import {PostDetailData} from '../../../Libraries/Structs/ControllerStructs';

export const useForumPostQuery = (postID: string) => {
  return useTokenAuthQuery<PostDetailData>(`/forum/post/${postID}`);
};
