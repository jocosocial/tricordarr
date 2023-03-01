import React from 'react';
import {StyleSheet} from 'react-native';
import {Banner, Text, useTheme} from 'react-native-paper';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useNavigation} from '@react-navigation/native';

export const ErrorBanner = () => {
  const {errorBanner, setErrorBanner} = useErrorHandler();
  const onDismiss = () => setErrorBanner('');
  const theme = useTheme();
  const navigation = useNavigation();

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
      onDismiss={onDismiss}
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
