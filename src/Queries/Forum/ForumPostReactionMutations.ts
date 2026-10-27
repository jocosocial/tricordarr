import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {PostData, PostReactionData} from '#src/Structs/ControllerStructs';

interface ForumPostReactionProps {
  postID: string;
  reaction: string;
  action: 'create' | 'delete';
}

export const useForumPostReactionMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  /** Sends an add or remove request for one forum-post reaction. */
  const reactionQueryHandler = async ({postID, reaction, action}: ForumPostReactionProps) => {
    const endpoint = action === 'delete' ? 'unreact' : 'react';
    return await apiPost<PostData, PostReactionData>(`/forum/post/${postID}/${endpoint}`, {reaction});
  };

  return useTokenAuthMutation(reactionQueryHandler);
};
