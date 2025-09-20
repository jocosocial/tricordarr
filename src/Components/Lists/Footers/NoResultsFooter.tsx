import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Divider, Text} from 'react-native-paper';

import {FlexCenteredContentView} from '#src/Components/Views/Content/FlexCenteredContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';

export const NoResultsFooter = () => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    innerContainer: {
      ...commonStyles.paddingHorizontal,
      ...commonStyles.overscroll,
    },
    outerContainer: {
      ...commonStyles.paddingTop,
    },
  });

  return (
    <View style={styles.outerContainer}>
      <Divider bold={true} />
      <View style={styles.innerContainer}>
        <FlexCenteredContentView>
          <Text variant={'labelMedium'}>No Results</Text>
        </FlexCenteredContentView>
      </View>
    </View>
  );
};
