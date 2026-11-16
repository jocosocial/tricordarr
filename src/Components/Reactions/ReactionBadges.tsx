import React, {useMemo} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';

import {ReactionIcon} from '#src/Components/Reactions/ReactionIcon';
import {ReactionsDetailModal} from '#src/Components/Views/Modals/ReactionsDetailModal';
import {useCustomEmoji} from '#src/Context/Contexts/CustomEmojiContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useLazyVisibility} from '#src/Hooks/useLazyVisibility';
import {reactionAccessibilityName} from '#src/Libraries/Reactions/CustomEmojiCatalog';
import {ReactionData} from '#src/Structs/ControllerStructs';

interface ReactionBadgesProps {
  reactions: ReactionData[];
  /** Toggles the current user's reaction on the tapped badge. Taps do nothing when omitted. */
  onBadgePress?: (reaction: string) => void;
  /**
   * The reaction whose request is in flight, if any. Its badge shows a spinner for its count; if
   * the post has no such badge yet, a placeholder badge stands in until Swiftarr answers.
   */
  pendingReaction?: string;
}

/**
 * Displays the grouped reactions beneath a post. A tap toggles the user's own reaction, matching the
 * web UI; a long press opens the participant list.
 */
export const ReactionBadges = ({reactions, onBadgePress, pendingReaction}: ReactionBadgesProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {currentUserID} = useSession();
  const details = useLazyVisibility();
  const CustomEmoji = useCustomEmoji();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          ...commonStyles.flexRow,
          ...commonStyles.flexWrap,
        },
        badge: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingVerticalTiny,
          ...commonStyles.roundedBorderLarge,
          ...commonStyles.marginRightSmall,
          ...commonStyles.marginBottomSmall,
          backgroundColor: theme.colors.reactionBadge,
        },
        selectedBadge: {
          backgroundColor: theme.colors.primary,
        },
        text: {
          ...commonStyles.bold,
          ...commonStyles.marginLeftSmall,
        },
        selectedText: {
          color: theme.colors.onPrimary,
        },
        // Badges that will not respond while another reaction on this post is being sent.
        waitingBadge: {
          opacity: 0.5,
        },
      }),
    [commonStyles, theme.colors.onPrimary, theme.colors.primary, theme.colors.reactionBadge],
  );

  // A reaction being added that no badge shows yet: the first of its kind on this post.
  const pendingAddition =
    pendingReaction !== undefined && !reactions.some(reaction => reaction.reaction === pendingReaction)
      ? pendingReaction
      : undefined;

  if (reactions.length === 0 && pendingAddition === undefined) {
    return null;
  }

  return (
    <>
      <View style={styles.row}>
        {reactions.map(reaction => {
          const selected = !!currentUserID && ReactionData.hasUserReacted([reaction], currentUserID);
          const pending = pendingReaction === reaction.reaction;
          // One request per post at a time: until it settles, taps on the other badges are ignored,
          // so they are dimmed rather than left looking tappable.
          const waiting = pendingReaction !== undefined && !pending;
          const pressable = !!onBadgePress && pendingReaction === undefined;
          const count = reaction.users.length;
          const tapHint = selected ? 'Tap to remove your reaction.' : 'Tap to add your reaction.';
          return (
            <TouchableOpacity
              // Shared by every badge, like the message testID; flows narrow it with `text` or `index`.
              testID={'reactionBadge-button'}
              accessibilityRole={'button'}
              // A custom emoji is announced by its name ("arr"), not its token (":arr:").
              accessibilityLabel={`${reactionAccessibilityName(CustomEmoji, reaction.reaction)}, ${count} ${
                count === 1 ? 'reaction' : 'reactions'
              }`}
              accessibilityHint={`${pressable ? `${tapHint} ` : ''}Long press to see who reacted.`}
              accessibilityState={{selected, busy: pending, disabled: waiting}}
              key={reaction.reaction}
              onPress={pressable ? () => onBadgePress(reaction.reaction) : undefined}
              onLongPress={details.show}
              style={[styles.badge, selected && styles.selectedBadge, waiting && styles.waitingBadge]}>
              <ReactionIcon reaction={reaction.reaction} />
              {pending ? (
                <ActivityIndicator
                  size={theme.fonts.bodyMedium.fontSize}
                  color={selected ? theme.colors.onPrimary : undefined}
                  style={commonStyles.marginLeftSmall}
                />
              ) : (
                <Text style={[styles.text, selected && styles.selectedText]}>{count}</Text>
              )}
            </TouchableOpacity>
          );
        })}
        {pendingAddition !== undefined && (
          <View
            testID={'reactionBadgePending-view'}
            accessible={true}
            accessibilityRole={'progressbar'}
            accessibilityLabel={`Adding ${reactionAccessibilityName(CustomEmoji, pendingAddition)} reaction`}
            accessibilityState={{busy: true}}
            style={styles.badge}>
            <ReactionIcon reaction={pendingAddition} />
            <ActivityIndicator size={theme.fonts.bodyMedium.fontSize} style={commonStyles.marginLeftSmall} />
          </View>
        )}
      </View>
      {details.mounted && (
        <ReactionsDetailModal reactions={reactions} visible={details.visible} onDismiss={details.hide} />
      )}
    </>
  );
};
