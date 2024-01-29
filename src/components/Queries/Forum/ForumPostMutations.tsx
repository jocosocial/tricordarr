import axios, {AxiosResponse} from 'axios';
import {PostContentData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../TokenAuthMutation';

const deleteQueryHandler = async ({postID}: {postID: string}): Promise<AxiosResponse<void>> => {
  return await axios.delete(`/forum/post/${postID}`);
};
export const useForumPostDeleteMutation = () => {
  return useTokenAuthMutation(deleteQueryHandler);
};

const createQueryHandler = async ({
  forumID,
  postData,
}: {
  forumID: string;
  postData: PostContentData;
}): Promise<AxiosResponse<PostData>> => {
  return await axios.post(`/forum/${forumID}/create`, postData);
};

export const useForumPostCreateMutation = () => {
  return useTokenAuthMutation(createQueryHandler);
};

interface ForumPostUpdateMutationProps {
  postID: string;
  postContentData: PostContentData;
}

const forumPostUpdateHandler = async ({
  postID,
  postContentData,
}: ForumPostUpdateMutationProps): Promise<AxiosResponse<PostData>> => {
  return await axios.post(`/forum/post/${postID}/update`, postContentData);
};

export const useForumPostUpdateMutation = () => {
  return useTokenAuthMutation(forumPostUpdateHandler);
};
