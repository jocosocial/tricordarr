import React from 'react';
import EmojiPicker from 'rn-emoji-keyboard';

interface EmojiPickerModalProps {
  open: boolean;
  onClose: () => void;
  onEmojiSelected: (emoji: string) => void;
}

export const EmojiPickerModal = ({open, onClose, onEmojiSelected}: EmojiPickerModalProps) => {
  return (
    <EmojiPicker
      open={open}
      onClose={onClose}
      onEmojiSelected={emojiObject => {
        onEmojiSelected(emojiObject.emoji);
        onClose();
      }}
    />
  );
};
