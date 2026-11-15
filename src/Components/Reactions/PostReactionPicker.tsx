import React from 'react';

import {EmojiPickerModal} from '#src/Components/Reactions/EmojiPickerModal';
import {usePostReaction} from '#src/Hooks/usePostReaction';
import {ReactionTarget} from '#src/Libraries/Reactions/ReactionActions';

interface PostReactionPickerProps {
  target: ReactionTarget;
  open: boolean;
  onClose: () => void;
}

/**
 * Reaction picker for a forum or chat post. Mount this only once the user asks to react: it holds
 * the picker, mutation and cache reducers, which are too heavy to keep idle on every post in a list.
 */
export const PostReactionPicker = ({target, open, onClose}: PostReactionPickerProps) => {
  const {addReaction} = usePostReaction(target);
  return <EmojiPickerModal open={open} onClose={onClose} onEmojiSelected={addReaction} />;
};
