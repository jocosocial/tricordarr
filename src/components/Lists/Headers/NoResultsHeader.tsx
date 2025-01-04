import {Divider, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {FlexCenteredContentView} from '../../Views/Content/FlexCenteredContentView.tsx';

export const NoResultsHeader = () => {
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
          <Text variant={'labelMedium'}>No Results</Text>
        </FlexCenteredContentView>
      </View>
    </>
  );
};
