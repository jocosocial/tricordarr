import {HelperText, Text} from 'react-native-paper';
import {PaddedContentView} from '../Content/PaddedContentView';
import React, {useCallback, useEffect, useState} from 'react';
import {useAppTheme} from '../../../styles/Theme';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {useAppState} from '@react-native-community/hooks';
import {BatteryOptEnabled, RequestDisableOptimization} from 'react-native-battery-optimization-check';

export const BatteryOptimizationSettingsView = () => {
  const theme = useAppTheme();
  const {commonStyles} = useStyles();
  const [optEnabled, setOptEnabled] = useState(false);
  const appStateVisible = useAppState();

  const checkOptimization = useCallback(() => {
    BatteryOptEnabled().then((result: boolean) => {
      setOptEnabled(result);
    });
  }, []);

  useEffect(() => {
    if (appStateVisible === 'active') {
      checkOptimization();
    }
  }, [appStateVisible, checkOptimization]);

  return (
    <PaddedContentView padTop={true}>
      <Text variant={'titleMedium'} style={commonStyles.marginBottomSmall}>
        Battery Optimization
      </Text>
      <Text style={commonStyles.marginBottomSmall}>
        By default, Android will apply battery optimization to all apps on your device. However this means the
        background worker which this app relies on can be shut down at almost any time, resulting in missed push
        notifications. You can disable Battery Optimization here to potentially get more reliable notifications.
        Press the button below, then select "Allow" in the dialog that appears.
      </Text>
      <PrimaryActionButton
        buttonText={optEnabled ? 'Disable Optimization' : 'Already disabled'}
        buttonColor={theme.colors.twitarrNeutralButton}
        onPress={() => RequestDisableOptimization()}
        style={[commonStyles.marginTopSmall]}
        disabled={!optEnabled}
      />
      <HelperText type={'info'} style={{color: theme.colors.onBackground}}>
        Warning: this may cause the app to consume more battery. You can always change this setting by long-pressing the
        app's icon on your home screen and selecting "App Info", then "App battery usage".
      </HelperText>
    </PaddedContentView>
  );
};
