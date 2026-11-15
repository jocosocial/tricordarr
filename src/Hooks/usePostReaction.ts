import {useCallback, useState} from 'react';

import {useSession} from '#src/Context/Contexts/SessionContext';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {
  canReactTo,
  ReactionAction,
  ReactionTarget,
  reactionToggleAction,
} from '#src/Libraries/Reactions/ReactionActions';
import {usePostReactionMutation} from '#src/Queries/PostReactionMutations';
import {PostData} from '#src/Structs/ControllerStructs';

/**
 * Reactions for one forum or chat post, shared by the action menu's picker and the reaction badges.
 *
 * `pendingReaction` is the reaction whose request is in flight. The cache only changes once
 * Swiftarr answers, which can take a while on ship wifi, so badges use it to show progress. Further
 * requests are ignored until it settles: a second tap would otherwise repeat the first request
 * rather than undo it, because the cached reactions it is compared against have not changed yet.
 */
export const usePostReaction = (target: ReactionTarget) => {
  const {currentUserID} = useSession();
  const {updatePostReactions: updateForumPostReactions} = useForumCacheReducer();
  const {updatePostReactions: updateFezPostReactions} = useFezCacheReducer();
  const {mutate} = usePostReactionMutation();
  const [pendingReaction, setPendingReaction] = useState<string>();
  const canReact = canReactTo(target, currentUserID);
  const busy = pendingReaction !== undefined;

  const send = useCallback(
    (reaction: string, action: ReactionAction) => {
      if (!canReact || busy) {
        return;
      }
      setPendingReaction(reaction);
      mutate(
        {kind: target.kind, postID: target.post.postID, reaction, action},
        {
          onSuccess: response => {
            if (target.kind === 'forumPost') {
              updateForumPostReactions(response.data as PostData, target.forumID);
            } else if (target.fez) {
              updateFezPostReactions(target.fez.fezID, response.data.postID, response.data.reactions);
            }
          },
          onSettled: () => setPendingReaction(undefined),
        },
      );
    },
    [busy, canReact, mutate, target, updateFezPostReactions, updateForumPostReactions],
  );

  /**
   * Adds a reaction chosen in the picker. The picker never removes: Swiftarr stores a canonical form
   * (`☺️` comes back as `☺`), so a picked emoji cannot be matched reliably against the user's
   * existing reactions. Adding one the user already has is a no-op on the server.
   */
  const addReaction = useCallback((reaction: string) => send(reaction, 'create'), [send]);

  /** For a reaction badge, whose string came from the server: adds or removes the user's reaction. */
  const toggleReaction = useCallback(
    (reaction: string) => send(reaction, reactionToggleAction(target.post.reactions, currentUserID ?? '', reaction)),
    [currentUserID, send, target.post.reactions],
  );

  return {addReaction, toggleReaction, canReact, pendingReaction};
};
