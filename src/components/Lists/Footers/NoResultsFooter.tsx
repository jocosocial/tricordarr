import {Divider, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import React from 'react';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {FlexCenteredContentView} from '#src/Components/Views/Content/FlexCenteredContentView';

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
