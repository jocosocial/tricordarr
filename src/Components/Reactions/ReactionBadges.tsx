import React, {useMemo} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';

import {ReactionIcon} from '#src/Components/Reactions/ReactionIcon';
import {ReactionsDetailModal} from '#src/Components/Views/Modals/ReactionsDetailModal';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {styleDefaults} from '#src/Context/Providers/StyleProvider';
import {useLazyVisibility} from '#src/Hooks/useLazyVisibility';
import {ReactionData} from '#src/Structs/ControllerStructs';

interface ReactionBadgesProps {
  reactions: ReactionData[];
  /** Toggles the current user's reaction on the tapped badge. Taps do nothing when omitted. */
  onBadgePress?: (reaction: string) => void;
  alignRight?: boolean;
}

/**
 * Displays the grouped reactions beneath a post. A tap toggles the user's own reaction, matching the
 * web UI; a long press opens the participant list.
 */
export const ReactionBadges = ({reactions, onBadgePress, alignRight = false}: ReactionBadgesProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {currentUserID} = useSession();
  const details = useLazyVisibility();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          ...commonStyles.flexRow,
          ...commonStyles.flexWrap,
          ...(alignRight ? commonStyles.flexEnd : commonStyles.flexStart),
          ...commonStyles.fullWidth,
          // MessageView pads the bottom of the message text; pull the badges up into that padding
          // so they sit directly beneath the text.
          marginTop: -styleDefaults.marginSize / 2,
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
        selectedText: {
          color: theme.colors.onPrimary,
        },
        text: {
          ...commonStyles.bold,
          ...commonStyles.marginLeftSmall,
        },
      }),
    [alignRight, commonStyles, theme.colors.onPrimary, theme.colors.primary, theme.colors.reactionBadge],
  );

  if (reactions.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.row}>
        {reactions.map(reaction => {
          const selected = !!currentUserID && ReactionData.hasUserReacted([reaction], currentUserID);
          return (
            <TouchableOpacity
              accessibilityLabel={`${reaction.reaction}, ${reaction.users.length} reactions`}
              key={reaction.reaction}
              onPress={onBadgePress ? () => onBadgePress(reaction.reaction) : undefined}
              onLongPress={details.show}
              style={[styles.badge, selected && styles.selectedBadge]}>
              <ReactionIcon reaction={reaction.reaction} />
              <Text style={[styles.text, selected && styles.selectedText]}>{reaction.users.length}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {details.mounted && (
        <ReactionsDetailModal reactions={reactions} visible={details.visible} onDismiss={details.hide} />
      )}
    </>
  );
};
