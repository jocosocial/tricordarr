import React from 'react';

import {ReactionBadges} from '#src/Components/Reactions/ReactionBadges';
import {usePostReaction} from '#src/Hooks/usePostReaction';
import {ReactionTarget} from '#src/Libraries/Reactions/ReactionActions';

interface PostReactionBadgesProps {
  target: ReactionTarget;
}

/**
 * Reaction badges for a forum or chat post. Rows render this only when the post has reactions or one
 * is being sent, so a post with nothing to show adds no views.
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
