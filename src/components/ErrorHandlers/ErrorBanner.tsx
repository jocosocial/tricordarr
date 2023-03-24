import React from 'react';
import {StyleSheet} from 'react-native';
import {Banner, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useAppTheme} from '../../styles/Theme';
import {MaterialBottomTabNavigationProp} from '@react-navigation/material-bottom-tabs';

export const ErrorBanner = () => {
  const {errorBanner, setErrorBanner} = useErrorHandler();
  const theme = useAppTheme();
  const navigation = useNavigation<MaterialBottomTabNavigationProp<any>>();

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
          onPress: () => navigation.jumpTo('SettingsTab'),
          labelStyle: styles.button,
        },
        {
          label: 'Dismiss',
          onPress: () => setErrorBanner(''),
          labelStyle: styles.button,
        },
      ]}>
      <Text style={styles.innerText}>{errorBanner}</Text>
    </Banner>
  );
};
