import {AxiosResponse} from 'axios';
import {PostContentData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

export const useForumPostDeleteMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const deleteQueryHandler = async ({postID}: {postID: string}): Promise<AxiosResponse<void>> => {
    return await ServerQueryClient.delete(`/forum/post/${postID}`);
  };

  return useTokenAuthMutation(deleteQueryHandler);
};

export const useForumPostCreateMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const createQueryHandler = async ({
    forumID,
    postData,
  }: {
    forumID: string;
    postData: PostContentData;
  }): Promise<AxiosResponse<PostData>> => {
    return await ServerQueryClient.post(`/forum/${forumID}/create`, postData);
  };

  return useTokenAuthMutation(createQueryHandler);
};

interface ForumPostUpdateMutationProps {
  postID: string;
  postContentData: PostContentData;
}

export const useForumPostUpdateMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const forumPostUpdateHandler = async ({
    postID,
    postContentData,
  }: ForumPostUpdateMutationProps): Promise<AxiosResponse<PostData>> => {
    return await ServerQueryClient.post(`/forum/post/${postID}/update`, postContentData);
  };

  return useTokenAuthMutation(forumPostUpdateHandler);
};
