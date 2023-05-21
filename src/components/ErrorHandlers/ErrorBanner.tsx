import React from 'react';
import {StyleSheet} from 'react-native';
import {Banner, Text} from 'react-native-paper';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useAppTheme} from '../../styles/Theme';
import {useBottomTabNavigator} from '../Navigation/Tabs/BottomTabNavigator';
import {BottomTabComponents, SettingsStackScreenComponents} from '../../libraries/Enums/Navigation';

export const ErrorBanner = () => {
  const {errorBanner, setErrorBanner} = useErrorHandler();
  const theme = useAppTheme();
  const navigation = useBottomTabNavigator();

  const styles = StyleSheet.create({
    banner: {
      backgroundColor: theme.colors.error,
    },
    innerText: {
      color: theme.colors.onError,
    },
    button: {
      color: theme.colors.onPrimary,
    },
  });

  return (
    <Banner
      style={styles.banner}
      visible={!!errorBanner}
      actions={[
        {
          label: 'Settings',
          onPress: () =>
            navigation.jumpTo(BottomTabComponents.settingsTab, {
              screen: SettingsStackScreenComponents.settings,
            }),
          labelStyle: styles.button,
        },
        {
          label: 'Dismiss',
          onPress: () => setErrorBanner(undefined),
          labelStyle: styles.button,
        },
      ]}>
      <Text style={styles.innerText}>{errorBanner}</Text>
    </Banner>
  );
};
