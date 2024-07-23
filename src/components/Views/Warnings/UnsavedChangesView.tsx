import {Text} from 'react-native-paper';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

interface UnsavedChangesBannerProps {
  isVisible: boolean;
}

/**
 * React Native Paper has a quirk where if you fill out a form and the keyboard is visible, tapping
 * the button to submit the form dismisses the keyboard. It takes a second press to submit the form.
 * I was worried that users might not realize their form hadn't submitted yet. So this Banner-esque
 * view gets shown if there is unsaved work based on a trigger field in the form <DirtyDetectionField>.
 * This gets cleared in response to navigation events in each Navigator.
 * @param isVisible Show this view or not.
 * @constructor
 */
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
