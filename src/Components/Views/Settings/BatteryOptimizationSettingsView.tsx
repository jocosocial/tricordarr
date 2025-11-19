import {useAppState} from '@react-native-community/hooks';
import React, {useCallback, useEffect, useState} from 'react';
import {Platform, View} from 'react-native';
// @ts-ignore
import {BatteryOptEnabled, RequestDisableOptimization} from 'react-native-battery-optimization-check';
import {HelperText, Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

const BatteryOptimizationSettingsViewInternal = () => {
  const {theme} = useAppTheme();
  const {commonStyles} = useStyles();
  const [optEnabled, setOptEnabled] = useState(false);
  const appStateVisible = useAppState();

  const checkOptimization = useCallback(() => {
    BatteryOptEnabled().then((result: boolean) => {
      setOptEnabled(result);
    });
    setOptEnabled(false);
  }, []);

  useEffect(() => {
    if (appStateVisible === 'active') {
      checkOptimization();
    }
  }, [appStateVisible, checkOptimization]);

  return (
    <View>
      <ListSection>
        <ListSubheader>Battery Optimization</ListSubheader>
      </ListSection>

      <PaddedContentView padTop={true}>
        <Text style={commonStyles.marginBottomSmall}>
          You can disable Battery Optimization here to potentially get more reliable notifications. Press the button
          below, then select "Allow" in the dialog that appears.
        </Text>
        <PrimaryActionButton
          buttonText={optEnabled ? 'Disable Optimization' : 'Already disabled'}
          buttonColor={theme.colors.twitarrNeutralButton}
          onPress={() => {
            RequestDisableOptimization();
            console.log('Battery optimization disabled - feature temporarily unavailable');
          }}
          style={[commonStyles.marginTopSmall]}
          disabled={!optEnabled}
        />
        <HelperText type={'info'} style={{color: theme.colors.onBackground}}>
          Warning: this may cause the app to consume more battery. You can always change this setting by long-pressing
          the app's icon on your home screen and selecting "App Info", then "App battery usage".
        </HelperText>
      </PaddedContentView>
    </View>
  );
};

export const BatteryOptimizationSettingsView = () => {
  if (Platform.OS !== 'android') {
    return null;
  }
  return <BatteryOptimizationSettingsViewInternal />;
};
