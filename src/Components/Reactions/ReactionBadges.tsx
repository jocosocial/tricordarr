import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {ReactionData} from '#src/Structs/ControllerStructs';

interface ReactionBadgesProps {
  reactions?: ReactionData[];
  currentUserID: string;
  onBadgePress: () => void;
  alignRight?: boolean;
}

export const ReactionBadges = ({reactions, currentUserID, onBadgePress, alignRight = false}: ReactionBadgesProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const safeReactions = reactions ?? [];
  const hasCurrentUserReaction = ReactionData.hasUserReacted(safeReactions, currentUserID);
  const badgeText = safeReactions.map(reaction => `${reaction.emoji} ${reaction.users.length}`).join('   ');

  if (safeReactions.length === 0) {
    return null;
  }

  const styles = StyleSheet.create({
    row: {
      ...commonStyles.flexRow,
      ...commonStyles.flexWrap,
      ...(alignRight ? commonStyles.flexEnd : commonStyles.flexStart),
      ...commonStyles.fullWidth,
      marginTop: -8,
    },
    badge: {
      ...commonStyles.paddingHorizontalSmall,
      ...commonStyles.paddingVerticalTiny,
      ...commonStyles.roundedBorderLarge,
      ...commonStyles.marginRightSmall,
      ...commonStyles.marginBottomSmall,
    },
    text: {
      ...commonStyles.bold,
    },
  });

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={onBadgePress}
        style={[
          styles.badge,
          {
            backgroundColor: hasCurrentUserReaction ? theme.colors.primaryContainer : theme.colors.secondaryContainer,
          },
        ]}>
        <Text style={styles.text}>{badgeText}</Text>
      </TouchableOpacity>
    </View>
  );
};
