import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';

import {ListItem} from '#src/Components/Lists/ListItem';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
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
      }),
    [commonStyles.bold, theme.colors.twitarrPositiveButton],
  );

  const onPress = useCallback(() => {
    navigation.push(CommonStackComponents.huntPuzzleScreen, {puzzleID: puzzle.puzzleID});
  }, [navigation, puzzle.puzzleID]);

  return (
    <ListItem
      title={puzzle.title}
      titleStyle={styles.title}
      description={puzzle.answer}
      descriptionStyle={puzzle.answer ? styles.answer : undefined}
      onPress={onPress}
    />
  );
};

export const HuntPuzzleListItem = memo(HuntPuzzleListItemInternal);
