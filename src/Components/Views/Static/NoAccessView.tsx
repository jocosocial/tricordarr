import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppView} from '#src/Components/Views/AppView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface NoAccessViewProps {
  message?: string;
  testID?: string;
}

/**
 * Shown when the current user lacks the privilege or role a screen requires. Generic by
 * design: the message is the same regardless of which gate rejected them. Rendered by
 * NoAccessScreen rather than used directly.
 */
export const NoAccessView = ({
  message = 'You do not have permission to view this screen.',
  testID = 'noAccessBack-button',
}: NoAccessViewProps) => {
  const {commonStyles} = useStyles();
  const navigation = useCommonStack();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        outerContainer: {
          ...commonStyles.flex,
          ...commonStyles.justifyCenter,
          ...commonStyles.alignItemsCenter,
        },
        innerContainer: {
          ...commonStyles.justifyCenter,
          ...commonStyles.alignItemsCenter,
        },
        contentContainer: {
          ...commonStyles.marginVerticalSmall,
        },
      }),
    [commonStyles],
  );

  return (
    <AppView>
      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.contentContainer}>
            <Text>{message}</Text>
          </View>
          <View style={styles.contentContainer}>
            <PrimaryActionButton testID={testID} buttonText={'Go Back'} onPress={() => navigation.goBack()} />
          </View>
        </View>
      </View>
    </AppView>
  );
};
