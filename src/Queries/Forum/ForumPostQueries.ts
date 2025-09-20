import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {PostDetailData} from '#src/Structs/ControllerStructs';

export const useForumPostQuery = (postID: string) => {
  return useTokenAuthQuery<PostDetailData>(`/forum/post/${postID}`);
};
