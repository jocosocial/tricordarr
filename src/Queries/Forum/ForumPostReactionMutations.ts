import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {PostData} from '#src/Structs/ControllerStructs';

interface ForumPostReactionProps {
  postID: string;
  emoji: string;
  action: 'create' | 'delete';
}

export const useForumPostReactionMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();

  const reactionQueryHandler = async ({postID, emoji, action}: ForumPostReactionProps) => {
    const encodedEmoji = encodeURIComponent(emoji);
    if (action === 'delete') {
      return await apiDelete<PostData>(`/forum/post/${postID}/react/${encodedEmoji}`);
    }
    return await apiPost<PostData>(`/forum/post/${postID}/react/${encodedEmoji}`);
  };

  return useTokenAuthMutation(reactionQueryHandler);
};
