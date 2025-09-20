import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Divider, Text} from 'react-native-paper';

import {FlexCenteredContentView} from '#src/Components/Views/Content/FlexCenteredContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';

export const EndResultsFooter = () => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    outerContainer: {
      ...commonStyles.paddingHorizontal,
      ...commonStyles.overscroll,
    },
  });

  return (
    <>
      <Divider bold={true} />
      <View style={styles.outerContainer}>
        <FlexCenteredContentView>
          <Text variant={'labelMedium'}>End of Results</Text>
        </FlexCenteredContentView>
      </View>
    </>
  );
};
