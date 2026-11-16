import {useCallback} from 'react';

import {usePendingReaction, usePostReactionContext} from '#src/Context/Contexts/PostReactionContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {canReactTo, ReactionTarget, reactionToggleAction} from '#src/Libraries/Reactions/ReactionActions';

/**
 * Reactions for one forum or chat post, shared by the action menu's picker and the reaction badges.
 *
 * The sending and the pending state live in PostReactionProvider, so this is light enough to use in
 * every list row, and the picker and the badges of one post agree on whether a request is in flight.
 */
export const usePostReaction = (target: ReactionTarget) => {
  const {currentUserID} = useSession();
  const {sendReaction} = usePostReactionContext();
  const pendingReaction = usePendingReaction(target.kind, target.post.postID);
  const canReact = canReactTo(target, currentUserID);

  /**
   * Adds a reaction chosen in the picker using its exact Unicode sequence or custom token.
   * Adding one the user already has is a no-op on the server.
   */
  const addReaction = useCallback(
    (reaction: string) => {
      if (canReact) {
        sendReaction(target, reaction, 'create');
      }
    },
    [canReact, sendReaction, target],
  );

  /** For a reaction badge, whose string came from the server: adds or removes the user's reaction. */
  const toggleReaction = useCallback(
    (reaction: string) => {
      if (canReact) {
        sendReaction(target, reaction, reactionToggleAction(target.post.reactions, currentUserID ?? '', reaction));
      }
    },
    [canReact, currentUserID, sendReaction, target],
  );

  return {addReaction, toggleReaction, canReact, pendingReaction};
};
