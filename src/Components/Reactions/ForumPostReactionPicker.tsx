import React from 'react';

import {EmojiPickerModal} from '#src/Components/Reactions/EmojiPickerModal';
import {useForumPostReaction} from '#src/Hooks/Forum/useForumPostReaction';
import {PostData} from '#src/Structs/ControllerStructs';

interface ForumPostReactionPickerProps {
  forumPost: PostData;
  forumID?: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Reaction picker for a forum post. Mount this only once the user asks to react: it holds the
 * picker, mutation and cache reducer, which are too heavy to keep idle on every post in a thread.
 */
export const ForumPostReactionPicker = ({forumPost, forumID, open, onClose}: ForumPostReactionPickerProps) => {
  const {addReaction} = useForumPostReaction(forumPost, forumID);
  return <EmojiPickerModal open={open} onClose={onClose} onEmojiSelected={addReaction} />;
};
