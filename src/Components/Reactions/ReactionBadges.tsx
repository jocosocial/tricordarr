import React, {useMemo} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';

import {ReactionIcon} from '#src/Components/Reactions/ReactionIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {ReactionData} from '#src/Structs/ControllerStructs';

interface ReactionBadgesProps {
  reactions?: ReactionData[];
  currentUserID: string;
  onBadgePress: () => void;
  alignRight?: boolean;
}

/** Displays the grouped reactions beneath a post and opens their participant list. */
export const ReactionBadges = ({reactions, currentUserID, onBadgePress, alignRight = false}: ReactionBadgesProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const safeReactions = reactions ?? [];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          ...commonStyles.flexRow,
          ...commonStyles.flexWrap,
          ...(alignRight ? commonStyles.flexEnd : commonStyles.flexStart),
          ...commonStyles.fullWidth,
          marginTop: -8,
        },
        badge: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingVerticalTiny,
          ...commonStyles.roundedBorderLarge,
          ...commonStyles.marginRightSmall,
          ...commonStyles.marginBottomSmall,
          backgroundColor: theme.colors.secondaryContainer,
        },
        selectedBadge: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingVerticalTiny,
          ...commonStyles.roundedBorderLarge,
          ...commonStyles.marginRightSmall,
          ...commonStyles.marginBottomSmall,
          backgroundColor: theme.colors.primaryContainer,
        },
        text: {
          ...commonStyles.bold,
          ...commonStyles.marginLeftSmall,
        },
      }),
    [alignRight, commonStyles, theme.colors.primaryContainer, theme.colors.secondaryContainer],
  );

  if (safeReactions.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {safeReactions.map(reaction => {
        const selected = ReactionData.hasUserReacted([reaction], currentUserID);
        return (
          <TouchableOpacity
            accessibilityLabel={`${reaction.reaction}, ${reaction.users.length} reactions`}
            key={reaction.reaction}
            onPress={onBadgePress}
            style={selected ? styles.selectedBadge : styles.badge}>
            <ReactionIcon reaction={reaction.reaction} />
            <Text style={styles.text}>{reaction.users.length}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
