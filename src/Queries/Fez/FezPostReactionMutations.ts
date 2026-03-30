import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {FezPostData} from '#src/Structs/ControllerStructs';

interface FezPostReactionProps {
  fezPostID: string;
  emoji: string;
  action: 'create' | 'delete';
}

export const useFezPostReactionMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();

  const reactionQueryHandler = async ({fezPostID, emoji, action}: FezPostReactionProps) => {
    const encodedEmoji = encodeURIComponent(emoji);
    if (action === 'delete') {
      return await apiDelete<FezPostData>(`/fez/post/${fezPostID}/react/${encodedEmoji}`);
    }
    return await apiPost<FezPostData>(`/fez/post/${fezPostID}/react/${encodedEmoji}`);
  };

  return useTokenAuthMutation(reactionQueryHandler);
};
