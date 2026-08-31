import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {ListItem} from '#src/Components/Lists/ListItem';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {HuntPuzzleData} from '#src/Structs/ControllerStructs';

interface HuntPuzzleListItemProps {
  puzzle: HuntPuzzleData;
}

/**
 * Row for an unlocked puzzle within a hunt. Solved puzzles show the canonical answer.
 */
const HuntPuzzleListItemInternal = ({puzzle}: HuntPuzzleListItemProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const navigation = useCommonStack();
  const solved = !!puzzle.answer;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          ...commonStyles.bold,
        },
        answer: {
          ...commonStyles.bold,
          color: theme.colors.twitarrPositiveButton,
          textTransform: 'uppercase',
        },
        icon: {
          ...commonStyles.paddingTopSmall,
        },
      }),
    [commonStyles.bold, commonStyles.paddingTopSmall, theme.colors.twitarrPositiveButton],
  );

  const onPress = useCallback(() => {
    navigation.push(CommonStackComponents.huntPuzzleScreen, {puzzleID: puzzle.puzzleID});
  }, [navigation, puzzle.puzzleID]);

  const getLeft = useCallback(
    () =>
      solved ? (
        <AppIcon icon={AppIcons.check} color={theme.colors.twitarrPositiveButton} style={styles.icon} />
      ) : undefined,
    [solved, styles.icon, theme.colors.twitarrPositiveButton],
  );

  return (
    <ListItem
      title={puzzle.title}
      titleStyle={styles.title}
      description={puzzle.answer}
      descriptionStyle={solved ? styles.answer : undefined}
      onPress={onPress}
      left={solved ? getLeft : undefined}
    />
  );
};

export const HuntPuzzleListItem = memo(HuntPuzzleListItemInternal);
