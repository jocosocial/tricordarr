import React from 'react';

import {ReactionBadges} from '#src/Components/Reactions/ReactionBadges';
import {usePostReaction} from '#src/Hooks/usePostReaction';
import {ReactionTarget} from '#src/Libraries/Reactions/ReactionActions';

interface PostReactionBadgesProps {
  target: ReactionTarget;
}

/**
 * Reaction badges for a forum or chat post. Render this only for posts that have reactions: it
 * holds the mutation and cache reducers, which posts without badges have no use for.
 */
export const PostReactionBadges = ({target}: PostReactionBadgesProps) => {
  const {toggleReaction, canReact, pendingReaction} = usePostReaction(target);
  return (
    <ReactionBadges
      reactions={target.post.reactions ?? []}
      onBadgePress={canReact ? toggleReaction : undefined}
      pendingReaction={pendingReaction}
    />
  );
};
