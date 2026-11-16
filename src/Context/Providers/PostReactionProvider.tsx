import React, {PropsWithChildren, useCallback, useMemo, useRef} from 'react';

import {PostReactionContext, PostReactionContextType} from '#src/Context/Contexts/PostReactionContext';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {ReactionAction, ReactionTarget, reactionTargetKey} from '#src/Libraries/Reactions/ReactionActions';
import {createReactionPendingStore} from '#src/Libraries/Reactions/ReactionPendingStore';
import {usePostReactionMutation} from '#src/Queries/PostReactionMutations';
import {PostData} from '#src/Structs/ControllerStructs';

/**
 * Sends reactions for every forum and chat post in the app.
 *
 * One instance, rather than a hook in each post: the mutation and both cache reducers are heavy,
 * and a thread can show hundreds of posts with badges. Rows only read this context and subscribe to
 * their own post's pending state.
 *
 * The cache changes only once Swiftarr answers, which can take a while on ship wifi. Until then the
 * post is marked pending so its badges can show progress, and further requests for it are ignored:
 * a second tap would otherwise repeat the first request rather than undo it, because the cached
 * reactions it is compared against have not changed yet.
 */
export const PostReactionProvider = ({children}: PropsWithChildren) => {
  const {updatePostReactions: updateForumPostReactions} = useForumCacheReducer();
  const {updatePostReactions: updateFezPostReactions} = useFezCacheReducer();
  const {mutateAsync} = usePostReactionMutation();
  const pendingStore = useRef(createReactionPendingStore()).current;

  const sendReaction = useCallback(
    async (target: ReactionTarget, reaction: string, action: ReactionAction) => {
      const key = reactionTargetKey(target.kind, target.post.postID);
      if (!pendingStore.begin(key, reaction)) {
        return;
      }
      try {
        // mutateAsync, not mutate with callbacks: several posts can have requests in flight at once,
        // and mutate only runs the callbacks of the most recent call.
        const response = await mutateAsync({kind: target.kind, postID: target.post.postID, reaction, action});
        if (target.kind === 'forumPost') {
          updateForumPostReactions(response.data as PostData, target.forumID);
        } else if (target.fez) {
          updateFezPostReactions(
            target.fez.fezID,
            response.data.postID,
            response.data.reactions,
            response.data.reactionRevision,
          );
        }
      } catch {
        // useTokenAuthMutation has already shown and logged the error.
      } finally {
        pendingStore.end(key);
      }
    },
    [mutateAsync, pendingStore, updateFezPostReactions, updateForumPostReactions],
  );

  const value = useMemo<PostReactionContextType>(() => ({sendReaction, pendingStore}), [pendingStore, sendReaction]);

  return <PostReactionContext.Provider value={value}>{children}</PostReactionContext.Provider>;
};
