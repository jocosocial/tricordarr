import {useCallback} from 'react';

import {useSession} from '#src/Context/Contexts/SessionContext';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useFezPostReactionMutation} from '#src/Queries/Fez/FezPostReactionMutations';
import {FezData, FezPostData, ReactionData} from '#src/Structs/ControllerStructs';

/**
 * Reactions for one chat post, shared by the action menu's picker and the reaction chips.
 * `canReact` is false without the chat (its cache cannot be updated) and on the user's own posts,
 * which Swiftarr refuses reactions on.
 */
export const useFezPostReaction = (fezPost: FezPostData, fez?: FezData) => {
  const {currentUserID} = useSession();
  const {updatePostReactions} = useFezCacheReducer();
  const {mutate} = useFezPostReactionMutation();
  const fezID = fez?.fezID;
  const canReact = !!fezID && !!currentUserID && currentUserID !== fezPost.author.userID;

  const send = useCallback(
    (reaction: string, action: 'create' | 'delete') => {
      if (!fezID || !canReact) {
        return;
      }
      mutate(
        {fezPostID: fezPost.postID.toString(), reaction, action},
        {onSuccess: response => updatePostReactions(fezID, response.data.postID, response.data.reactions)},
      );
    },
    [canReact, fezID, fezPost.postID, mutate, updatePostReactions],
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
      const reacted = ReactionData.hasUserReacted(fezPost.reactions ?? [], currentUserID ?? '', reaction);
      send(reaction, reacted ? 'delete' : 'create');
    },
    [currentUserID, fezPost.reactions, send],
  );

  return {addReaction, toggleReaction, canReact};
};
