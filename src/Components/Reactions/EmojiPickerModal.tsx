import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Button, Dialog, Portal, Text} from 'react-native-paper';
import EmojiPicker from 'rn-emoji-keyboard';

import {ReactionIcon} from '#src/Components/Reactions/ReactionIcon';
import {useCustomEmoji} from '#src/Context/Contexts/CustomEmojiContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';

/** Named so each choice gets a stable testID; emoji themselves are not valid testID stems. */
const commonReactions = [
  {reaction: '👍', name: 'ThumbsUp'},
  {reaction: '❤️', name: 'Heart'},
  {reaction: '😆', name: 'Laugh'},
  {reaction: '😂', name: 'Joy'},
  {reaction: '🎉', name: 'Party'},
  {reaction: '👀', name: 'Eyes'},
  {reaction: '✅', name: 'Check'},
];

/** `:back-deck-juice:` becomes `BackDeckJuice`, the camelCase stem docs/Testing.md asks for. */
const testIDStem = (token: string) =>
  token
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join('');

interface EmojiPickerModalProps {
  open: boolean;
  onClose: () => void;
  onEmojiSelected: (emoji: string) => void;
}

/** Lets a user select common, custom, or any Unicode emoji reaction. */
export const EmojiPickerModal = ({open, onClose, onEmojiSelected}: EmojiPickerModalProps) => {
  const {commonStyles} = useStyles();
  const CustomEmoji = useCustomEmoji();
  const [unicodePickerOpen, setUnicodePickerOpen] = useState(false);
  const customReactions = Object.keys(CustomEmoji).filter(reaction => !CustomEmoji[reaction as string].secret);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        choices: {
          ...commonStyles.flexRow,
          ...commonStyles.flexWrap,
        },
        choice: {
          ...commonStyles.alignItemsCenter,
          ...commonStyles.justifyCenter,
          width: 48,
          height: 48,
        },
        sectionTitle: {
          ...commonStyles.bold,
          ...commonStyles.marginTopSmall,
        },
      }),
    [commonStyles],
  );

  /** Selects a reaction from the dialog and closes it. */
  const handleSelection = (reaction: string) => {
    onEmojiSelected(reaction);
    onClose();
  };

  return (
    <>
      <Portal>
        <Dialog visible={open && !unicodePickerOpen} onDismiss={onClose}>
          <Dialog.Title>React</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <Text style={styles.sectionTitle}>Common</Text>
              <View style={styles.choices}>
                {commonReactions.map(({reaction, name}) => (
                  <TouchableOpacity
                    testID={`reactionPicker${name}-button`}
                    accessibilityRole={'button'}
                    accessibilityLabel={`React with ${reaction}`}
                    key={reaction}
                    onPress={() => handleSelection(reaction)}
                    style={styles.choice}>
                    <ReactionIcon reaction={reaction} size={28} />
                  </TouchableOpacity>
                ))}
              </View>
              {/* Empty until the catalog has loaded from the server at least once. */}
              {customReactions.length > 0 && <Text style={styles.sectionTitle}>Twit-arr</Text>}
              <View style={styles.choices}>
                {customReactions.map(reaction => (
                  <TouchableOpacity
                    testID={`reactionPicker${testIDStem(reaction)}-button`}
                    accessibilityRole={'button'}
                    accessibilityLabel={`React with ${CustomEmoji[reaction].name}`}
                    key={reaction}
                    onPress={() => handleSelection(reaction)}
                    style={styles.choice}>
                    <ReactionIcon reaction={reaction} size={30} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button testID={'reactionPickerMoreEmoji-button'} onPress={() => setUnicodePickerOpen(true)}>
              More Emoji
            </Button>
            <Button testID={'reactionPickerCancel-button'} onPress={onClose}>
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <EmojiPicker
        open={open && unicodePickerOpen}
        onClose={() => {
          setUnicodePickerOpen(false);
          onClose();
        }}
        // The library calls onClose itself after a selection, so this must not close as well.
        onEmojiSelected={emojiObject => onEmojiSelected(emojiObject.emoji)}
      />
    </>
  );
};
