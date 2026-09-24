import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppView} from '#src/Components/Views/AppView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

/**
 * Shown when a user without the Shutternaut Manager role (or TwitarrTeam access) reaches the
 * photographer coverage report. Mirrors the server's own gate on
 * `GET /api/v3/events/photographerreport`.
 */
export const NotShutternautManagerView = () => {
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
            <Text>Shutternaut Manager access is required for this screen.</Text>
          </View>
          <View style={styles.contentContainer}>
            <PrimaryActionButton
              testID={'notShutternautManagerBack-button'}
              buttonText={'Go Back'}
              onPress={() => navigation.goBack()}
            />
          </View>
        </View>
      </View>
    </AppView>
  );
};
