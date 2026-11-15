import {useCallback} from 'react';

import {useSession} from '#src/Context/Contexts/SessionContext';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useForumPostReactionMutation} from '#src/Queries/Forum/ForumPostReactionMutations';
import {PostData, ReactionData} from '#src/Structs/ControllerStructs';

/**
 * Reactions for one forum post, shared by the action menu's picker and the reaction chips.
 * `canReact` is false on the user's own posts, which Swiftarr refuses reactions on.
 */
export const useForumPostReaction = (forumPost: PostData, forumID?: string) => {
  const {currentUserID} = useSession();
  const {updatePostReactions} = useForumCacheReducer();
  const {mutate, isPending} = useForumPostReactionMutation();
  const canReact = !!currentUserID && currentUserID !== forumPost.author.userID;

  const send = useCallback(
    (reaction: string, action: 'create' | 'delete') => {
      if (!canReact) {
        return;
      }
      mutate(
        {postID: forumPost.postID.toString(), reaction, action},
        {onSuccess: response => updatePostReactions(response.data, forumID)},
      );
    },
    [canReact, forumID, forumPost.postID, mutate, updatePostReactions],
  );

  /**
   * Adds a reaction chosen in the picker. The picker never removes: Swiftarr stores a canonical form
   * (`☺️` comes back as `☺`), so a picked emoji cannot be matched reliably against the user's
   * existing reactions. Adding one the user already has is a no-op on the server.
   */
  const addReaction = useCallback((reaction: string) => send(reaction, 'create'), [send]);

  /**
   * For a reaction chip, whose string came from the server: removes the reaction if the user
   * already reacted with it, otherwise adds it.
   */
  const toggleReaction = useCallback(
    (reaction: string) => {
      const reacted = ReactionData.hasUserReacted(forumPost.reactions ?? [], currentUserID ?? '', reaction);
      send(reaction, reacted ? 'delete' : 'create');
    },
    [currentUserID, forumPost.reactions, send],
  );

  return {addReaction, toggleReaction, canReact, isPending};
};
