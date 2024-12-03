import {ErrorResponse, ForumCreateData, ForumData} from '../../../libraries/Structs/ControllerStructs';
import {AxiosError, AxiosResponse} from 'axios';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface ForumCreateMutationProps {
  categoryId: string;
  forumCreateData: ForumCreateData;
}

export const useForumCreateMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const forumCreateQueryHandler = async ({
    categoryId,
    forumCreateData,
  }: ForumCreateMutationProps): Promise<AxiosResponse<ForumData>> => {
    return await ServerQueryClient.post(`/forum/categories/${categoryId}/create`, forumCreateData);
  };

  return useTokenAuthMutation<AxiosResponse<ForumData>, AxiosError<ErrorResponse>, ForumCreateMutationProps>(
    forumCreateQueryHandler,
  );
};

interface ForumRenameMutationProps {
  forumID: string;
  name: string;
}

export const useForumRenameMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const forumRenameQueryHandler = async ({forumID, name}: ForumRenameMutationProps) => {
    return await ServerQueryClient.post(`/forum/${forumID}/rename/${encodeURIComponent(name)}`);
  };

  return useTokenAuthMutation(forumRenameQueryHandler);
};
