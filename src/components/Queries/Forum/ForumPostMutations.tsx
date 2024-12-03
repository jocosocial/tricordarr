import {PostContentData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

export const useForumPostDeleteMutation = () => {
  const {apiDelete} = useSwiftarrQueryClient();

  const deleteQueryHandler = async ({postID}: {postID: string}) => {
    return await apiDelete({
      url: `/forum/post/${postID}`,
    });
  };

  return useTokenAuthMutation(deleteQueryHandler);
};

export const useForumPostCreateMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const createQueryHandler = async ({forumID, postData}: {forumID: string; postData: PostContentData}) => {
    return await apiPost<PostData, PostContentData>({
      url: `/forum/${forumID}/create`,
      body: postData,
    });
  };

  return useTokenAuthMutation(createQueryHandler);
};

interface ForumPostUpdateMutationProps {
  postID: string;
  postContentData: PostContentData;
}

export const useForumPostUpdateMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const forumPostUpdateHandler = async ({postID, postContentData}: ForumPostUpdateMutationProps) => {
    return await apiPost<PostData, PostContentData>({
      url: `/forum/post/${postID}/update`,
      body: postContentData,
    });
  };

  return useTokenAuthMutation(forumPostUpdateHandler);
};
