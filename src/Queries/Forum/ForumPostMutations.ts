import {PostContentData, PostData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation.ts';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext.ts';

export const useForumPostDeleteMutation = () => {
  const {apiDelete} = useSwiftarrQueryClient();

  const deleteQueryHandler = async ({postID}: {postID: string}) => {
    return await apiDelete(`/forum/post/${postID}`);
  };

  return useTokenAuthMutation(deleteQueryHandler);
};

export const useForumPostCreateMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const createQueryHandler = async ({forumID, postData}: {forumID: string; postData: PostContentData}) => {
    return await apiPost<PostData, PostContentData>(`/forum/${forumID}/create`, postData);
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
    return await apiPost<PostData, PostContentData>(`/forum/post/${postID}/update`, postContentData);
  };

  return useTokenAuthMutation(forumPostUpdateHandler);
};
