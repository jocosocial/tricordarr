import {HelperText, Text} from 'react-native-paper';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import React, {useCallback, useEffect, useState} from 'react';
import {useAppTheme} from '#src/Styles/Theme';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {useAppState} from '@react-native-community/hooks';
// @ts-ignore
import {BatteryOptEnabled, RequestDisableOptimization} from 'react-native-battery-optimization-check';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {View} from 'react-native';

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
          onPress={() => RequestDisableOptimization()}
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
