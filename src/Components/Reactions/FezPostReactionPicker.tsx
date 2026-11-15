import React from 'react';

import {EmojiPickerModal} from '#src/Components/Reactions/EmojiPickerModal';
import {useFezPostReaction} from '#src/Hooks/Fez/useFezPostReaction';
import {FezData, FezPostData} from '#src/Structs/ControllerStructs';

interface FezPostReactionPickerProps {
  fezPost: FezPostData;
  fez?: FezData;
  open: boolean;
  onClose: () => void;
}

/**
 * Reaction picker for a chat post. Mount this only once the user asks to react: it holds the
 * picker, mutation and cache reducer, which are too heavy to keep idle on every post in a chat.
 */
export const FezPostReactionPicker = ({fezPost, fez, open, onClose}: FezPostReactionPickerProps) => {
  const {addReaction} = useFezPostReaction(fezPost, fez);
  return <EmojiPickerModal open={open} onClose={onClose} onEmojiSelected={addReaction} />;
};
