import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {ReactionAction} from '#src/Libraries/Reactions/ReactionActions';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {FezPostData, PostData, PostReactionData} from '#src/Structs/ControllerStructs';

interface PostReactionProps {
  kind: 'forumPost' | 'fezPost';
  postID: number;
  reaction: string;
  action: ReactionAction;
}

export const usePostReactionMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  /** Sends an add or remove request for one reaction on a forum or chat post. */
  const reactionQueryHandler = async ({kind, postID, reaction, action}: PostReactionProps) => {
    const resource = kind === 'forumPost' ? 'forum' : 'fez';
    const endpoint = action === 'delete' ? 'unreact' : 'react';
    return await apiPost<PostData | FezPostData, PostReactionData>(`/${resource}/post/${postID}/${endpoint}`, {
      reaction,
    });
  };

  return useTokenAuthMutation(reactionQueryHandler);
};
