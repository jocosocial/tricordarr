import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {AppView} from '../AppView.tsx';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

export const DisabledView = () => {
  const {commonStyles} = useStyles();
  const styles = {
    outerContainer: [commonStyles.flex, commonStyles.justifyCenter, commonStyles.alignItemsCenter],
    innerContainer: [commonStyles.justifyCenter],
    contentContainer: [commonStyles.marginVerticalSmall, commonStyles.marginHorizontal],
  };
  const {serverUrl} = useSwiftarrQueryClient();
  const commonNavigation = useCommonStack();

  return (
    <AppView>
      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.contentContainer}>
            <Text>
              The server admins have temporarily disabled this section of Twitarr. It should be back up Soon™!
            </Text>
          </View>
          <View style={styles.contentContainer}>
            <Text
              onPress={() =>
                commonNavigation.push(CommonStackComponents.siteUIScreen, {timestamp: new Date().toISOString()})
              }>
              You could also check {serverUrl} to see if there is more information available.
            </Text>
          </View>
          <View style={styles.contentContainer}>
            <Text>
              If the feature works in the website but not in the app, it's likely that a critical bug in the app was
              discovered. The server admins may have disabled the feature for the app as a precaution.
            </Text>
          </View>
        </View>
      </View>
    </AppView>
  );
};
