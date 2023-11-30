import {useTokenAuthQuery} from '../TokenAuthQuery';
import {ForumData, PostContentData, PostData, PostDetailData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import axios, {AxiosResponse} from 'axios';

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
