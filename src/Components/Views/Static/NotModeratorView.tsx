import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppView} from '#src/Components/Views/AppView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

/**
 * Shown when a non-moderator reaches a moderator-only screen.
 */
export const NotModeratorView = () => {
  const {commonStyles} = useStyles();
  const navigation = useCommonStack();
  const styles = {
    outerContainer: [commonStyles.flex, commonStyles.justifyCenter, commonStyles.alignItemsCenter],
    innerContainer: [commonStyles.justifyCenter, commonStyles.alignItemsCenter],
    contentContainer: [commonStyles.marginVerticalSmall],
  };

  return (
    <AppView>
      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.contentContainer}>
            <Text>Moderator access is required for this screen.</Text>
          </View>
          <View style={styles.contentContainer}>
            <PrimaryActionButton
              testID={'not-moderator-back-button'}
              buttonText={'Go Back'}
              onPress={() => navigation.goBack()}
            />
          </View>
        </View>
      </View>
    </AppView>
  );
};
