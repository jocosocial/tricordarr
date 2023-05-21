import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {AppView} from '../AppView';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {BottomTabComponents, SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useBottomTabNavigator} from '../../Navigation/Tabs/BottomTabNavigator';
import {useStyles} from '../../Context/Contexts/StyleContext';

export const NotLoggedInView = () => {
  const navigation = useBottomTabNavigator();
  const {commonStyles} = useStyles();
  const onPress = () => {
    navigation.navigate(BottomTabComponents.settingsTab, {
      screen: SettingsStackScreenComponents.accountSettings,
      params: {
        title: 'Login',
      },
      // https://github.com/react-navigation/react-navigation/issues/7698
      initial: false,
    });
  };
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
            <Text>You are not logged in.</Text>
          </View>
          <View style={styles.contentContainer}>
            <PrimaryActionButton buttonText={'Login'} onPress={onPress} />
          </View>
        </View>
      </View>
    </AppView>
  );
};
