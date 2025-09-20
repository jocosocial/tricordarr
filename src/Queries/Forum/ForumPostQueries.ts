import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {PostDetailData} from '../../../Libraries/Structs/ControllerStructs';

export const useForumPostQuery = (postID: string) => {
  return useTokenAuthQuery<PostDetailData>(`/forum/post/${postID}`);
};
