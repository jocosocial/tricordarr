import {ErrorResponse, ForumCreateData, ForumData} from '../../../libraries/Structs/ControllerStructs';
import axios, {AxiosError, AxiosResponse} from 'axios';
import {useTokenAuthMutation} from '../TokenAuthMutation';

interface ForumCreateMutationProps {
  categoryId: string;
  forumCreateData: ForumCreateData;
}

const forumCreateQueryHandler = async ({
  categoryId,
  forumCreateData,
}: ForumCreateMutationProps): Promise<AxiosResponse<ForumData>> => {
  return await axios.post(`/forum/categories/${categoryId}/create`, forumCreateData);
};

export const useForumCreateMutation = () => {
  return useTokenAuthMutation<AxiosResponse<ForumData>, AxiosError<ErrorResponse>, ForumCreateMutationProps>(
    forumCreateQueryHandler,
  );
};

interface ForumRenameMutationProps {
  forumID: string;
  name: string;
}

const forumRenameQueryHandler = async ({forumID, name}: ForumRenameMutationProps) => {
  return await axios.post(`/forum/${forumID}/rename/${encodeURIComponent(name)}`);
};

export const useForumRenameMutation = () => {
  return useTokenAuthMutation(forumRenameQueryHandler);
};
