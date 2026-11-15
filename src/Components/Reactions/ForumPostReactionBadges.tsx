import React from 'react';

import {ReactionBadges} from '#src/Components/Reactions/ReactionBadges';
import {useForumPostReaction} from '#src/Hooks/Forum/useForumPostReaction';
import {PostData} from '#src/Structs/ControllerStructs';

interface ForumPostReactionBadgesProps {
  forumPost: PostData;
  forumID?: string;
}

/**
 * Reaction badges for a forum post. Render this only for posts that have reactions: it holds the
 * mutation and cache reducer, which posts without badges have no use for.
 */
export const ForumPostReactionBadges = ({forumPost, forumID}: ForumPostReactionBadgesProps) => {
  const {toggleReaction, canReact} = useForumPostReaction(forumPost, forumID);
  return <ReactionBadges reactions={forumPost.reactions ?? []} onBadgePress={canReact ? toggleReaction : undefined} />;
};
