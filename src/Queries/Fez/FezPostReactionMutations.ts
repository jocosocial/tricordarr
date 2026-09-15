import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {FezPostData, PostReactionData} from '#src/Structs/ControllerStructs';

interface FezPostReactionProps {
  fezPostID: string;
  reaction: string;
  action: 'create' | 'delete';
}

export const useFezPostReactionMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  /** Sends an add or remove request for one chat-post reaction. */
  const reactionQueryHandler = async ({fezPostID, reaction, action}: FezPostReactionProps) => {
    const endpoint = action === 'delete' ? 'unreact' : 'react';
    return await apiPost<FezPostData, PostReactionData>(`/fez/post/${fezPostID}/${endpoint}`, {reaction});
  };

  return useTokenAuthMutation(reactionQueryHandler);
};
