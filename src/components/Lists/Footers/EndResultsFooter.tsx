import {FlexCenteredContentView} from '../../Views/Content/FlexCenteredContentView.tsx';
import {Text} from 'react-native-paper';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

export const EndResultsFooter = () => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    outerContainer: {
      ...commonStyles.paddingHorizontal,
      ...commonStyles.overscroll,
    },
  });

  return (
    <View style={styles.outerContainer}>
      <FlexCenteredContentView>
        <Text variant={'labelMedium'}>End of Results</Text>
      </FlexCenteredContentView>
    </View>
  );
};
