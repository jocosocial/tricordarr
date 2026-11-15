import React from 'react';

import {ReactionBadges} from '#src/Components/Reactions/ReactionBadges';
import {useFezPostReaction} from '#src/Hooks/Fez/useFezPostReaction';
import {FezData, FezPostData} from '#src/Structs/ControllerStructs';

interface FezPostReactionBadgesProps {
  fezPost: FezPostData;
  fez?: FezData;
  alignRight?: boolean;
}

/**
 * Reaction badges for a chat post. Render this only for posts that have reactions: it holds the
 * mutation and cache reducer, which posts without badges have no use for.
 */
export const FezPostReactionBadges = ({fezPost, fez, alignRight}: FezPostReactionBadgesProps) => {
  const {toggleReaction, canReact} = useFezPostReaction(fezPost, fez);
  return (
    <ReactionBadges
      reactions={fezPost.reactions ?? []}
      onBadgePress={canReact ? toggleReaction : undefined}
      alignRight={alignRight}
    />
  );
};
