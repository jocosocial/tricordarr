import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {ForumCreateData, ForumData} from '#src/Structs/ControllerStructs';

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

export const useForumMarkReadMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const forumMarkReadQueryHandler = async ({forumID}: {forumID: string}) => {
    return await apiPost(`/forum/${forumID}/markRead`);
  };

  return useTokenAuthMutation(forumMarkReadQueryHandler);
};

/**
 * Soft-deletes a forum and its posts. Moderators can delete forums they do not own.
 * POST /api/v3/forum/:id/delete
 */
export const useForumDeleteMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const forumDeleteQueryHandler = async ({forumID}: {forumID: string}) => {
    return await apiPost(`/forum/${forumID}/delete`);
  };

  return useTokenAuthMutation(forumDeleteQueryHandler);
};
