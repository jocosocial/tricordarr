import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Styles/Theme';

interface PostLengthViewProps {
  content: string;
  maxChars?: number;
  maxLines?: number;
}

export const ContentPostLengthView = ({content, maxLines = 25, maxChars = 500}: PostLengthViewProps) => {
  const chars = content.length;
  const lines = content.split(/\r\n|\r|\n/).length;
  const {commonStyles} = useStyles();
  const theme = useAppTheme();

  const isMax = chars >= maxChars || lines >= maxLines;

  const styles = StyleSheet.create({
    container: {
      // ...commonStyles.flex,
      ...commonStyles.flexRow,
      ...commonStyles.justifyCenter,
      ...commonStyles.paddingBottomSmall,
    },
    text: {
      color: isMax ? theme.colors.twitarrNegativeButton : theme.colors.onBackground,
    },
  });
  return (
    <View style={styles.container}>
      <Text style={styles.text} variant={'labelMedium'}>
        {chars}/{maxChars} chars, {lines}/{maxLines} lines
      </Text>
    </View>
  );
};
