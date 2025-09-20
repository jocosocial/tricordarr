import {ForumCreateData, ForumData} from '#src/Structs/ControllerStructs';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';

interface ForumCreateMutationProps {
  categoryId: string;
  forumCreateData: ForumCreateData;
}

export const useForumCreateMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const forumCreateQueryHandler = async ({categoryId, forumCreateData}: ForumCreateMutationProps) => {
    return await apiPost<ForumData, ForumCreateData>(`/forum/categories/${categoryId}/create`, forumCreateData);
  };

  return useTokenAuthMutation(forumCreateQueryHandler);
};

interface ForumRenameMutationProps {
  forumID: string;
  name: string;
}

export const useForumRenameMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const forumRenameQueryHandler = async ({forumID, name}: ForumRenameMutationProps) => {
    return await apiPost(`/forum/${forumID}/rename/${encodeURIComponent(name)}`);
  };

  return useTokenAuthMutation(forumRenameQueryHandler);
};
