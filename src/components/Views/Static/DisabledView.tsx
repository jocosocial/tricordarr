import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {AppView} from '../AppView';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {RootStackComponents, useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {BottomTabComponents, MainStackComponents} from '../../../libraries/Enums/Navigation';

export const DisabledView = () => {
  const {commonStyles} = useStyles();
  const styles = {
    outerContainer: [commonStyles.flex, commonStyles.justifyCenter, commonStyles.alignItemsCenter],
    innerContainer: [commonStyles.justifyCenter],
    contentContainer: [commonStyles.marginVerticalSmall, commonStyles.marginHorizontal],
  };
  const {appConfig} = useConfig();
  const rootNavigation = useRootStack();

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
                rootNavigation.push(RootStackComponents.rootContentScreen, {
                  screen: BottomTabComponents.homeTab,
                  params: {
                    screen: MainStackComponents.siteUIScreen,
                    params: {
                      timestamp: new Date().toISOString(),
                    },
                  },
                })
              }>
              You could also check {appConfig.serverUrl} to see if there is more information available.
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
