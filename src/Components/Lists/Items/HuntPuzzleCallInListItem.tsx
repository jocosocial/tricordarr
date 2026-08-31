import React, {memo, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import {ListItem} from '#src/Components/Lists/ListItem';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {HuntPuzzleCallInResultData} from '#src/Structs/ControllerStructs';

interface HuntPuzzleCallInListItemProps {
  callIn: HuntPuzzleCallInResultData;
}

/**
 * One call-in attempt: submission, relative time, and correct / hint / incorrect result.
 */
const HuntPuzzleCallInListItemInternal = ({callIn}: HuntPuzzleCallInListItemProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();

  const resultColor = callIn.correct
    ? theme.colors.twitarrPositiveButton
    : callIn.hint
      ? theme.colors.twitarrYellow
      : theme.colors.twitarrNegativeButton;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          ...commonStyles.bold,
          textTransform: 'uppercase',
        },
        result: {
          color: resultColor,
        },
        time: {
          ...commonStyles.justifyCenter,
        },
      }),
    [commonStyles.bold, commonStyles.justifyCenter, resultColor],
  );

  const displaySubmission = callIn.correct ?? callIn.rawSubmission;
  const resultLabel = HuntPuzzleCallInResultData.getResultLabel(callIn);

  const getRight = () => (
    <View style={styles.time}>
      <RelativeTimeTag date={new Date(callIn.creationTime)} />
    </View>
  );

  return (
    <ListItem
      title={displaySubmission}
      titleStyle={styles.title}
      description={resultLabel}
      descriptionStyle={styles.result}
      descriptionNumberOfLines={0}
      right={getRight}
    />
  );
};

export const HuntPuzzleCallInListItem = memo(HuntPuzzleCallInListItemInternal);
