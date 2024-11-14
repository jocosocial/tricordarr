import React from 'react';
import {StyleSheet} from 'react-native';
import {Banner, Text} from 'react-native-paper';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext.ts';
import {useAppTheme} from '../../styles/Theme.ts';

export const ErrorBanner = () => {
  const {errorBanner, setErrorBanner} = useErrorHandler();
  const theme = useAppTheme();

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
          label: 'Dismiss',
          onPress: () => setErrorBanner(''),
          labelStyle: styles.button,
        },
      ]}>
      <Text style={styles.innerText}>{errorBanner}</Text>
    </Banner>
  );
};
