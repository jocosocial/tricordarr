import {Text} from 'react-native-paper';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

interface UnsavedChangesBannerProps {
  isVisible: boolean;
}

export const UnsavedChangesView = ({isVisible = false}: UnsavedChangesBannerProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    headerView: {
      ...commonStyles.errorContainer,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.paddingVerticalSmall,
    },
    headerText: {
      ...commonStyles.errorContainer,
    },
  });

  if (!isVisible) {
    return <></>;
  }

  return (
    <View style={styles.headerView}>
      <Text style={styles.headerText}>There are unsaved changes.</Text>
    </View>
  );
};
