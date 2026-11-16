import {createContext, useCallback, useContext, useSyncExternalStore} from 'react';

import {ReactionAction, ReactionTarget, reactionTargetKey} from '#src/Libraries/Reactions/ReactionActions';
import {ReactionPendingStore} from '#src/Libraries/Reactions/ReactionPendingStore';

export interface PostReactionContextType {
  /** Sends one reaction change and updates the caches. Ignored while the post has one in flight. */
  sendReaction: (target: ReactionTarget, reaction: string, action: ReactionAction) => void;
  pendingStore: ReactionPendingStore;
}

export const PostReactionContext = createContext(<PostReactionContextType>{});

export const usePostReactionContext = () => useContext(PostReactionContext);

/**
 * The reaction whose request is in flight for a post, if any. Cheap enough for every row in a list:
 * a row re-renders only when its own post's value changes.
 */
export const usePendingReaction = (kind: ReactionTarget['kind'], postID: number): string | undefined => {
  const {pendingStore} = usePostReactionContext();
  const getSnapshot = useCallback(
    () => pendingStore.get(reactionTargetKey(kind, postID)),
    [kind, pendingStore, postID],
  );
  return useSyncExternalStore(pendingStore.subscribe, getSnapshot);
};
