import {useFocusEffect} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

// @ts-ignore
import tricordarr from '#assets/PlayStore/tricordarr.jpg';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeWelcomeScreen>;

export const OobeWelcomeScreen = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const {appConfig, preRegistrationAvailable, updateAppConfig} = useConfig();
  const {theme} = useAppTheme();

  const setPreRegistrationMode = useCallback(
    (mode: boolean) => {
      updateAppConfig({...appConfig, preRegistrationMode: mode});
    },
    [appConfig, updateAppConfig],
  );

  const styles = StyleSheet.create({
    text: commonStyles.textCenter,
    image: commonStyles.roundedBorderLarge,
  });

  const onPreRegistrationPress = () => {
    setPreRegistrationMode(true);
    navigation.push(OobeStackComponents.oobeServerScreen);
  };

  /**
   * Uhhh.... why?
   */
  useFocusEffect(() => {
    console.log('[OobeWelcomeScreen.tsx] disabling preregistration mode');
    setPreRegistrationMode(false);
  });

  // Un/Semi came from Drew in https://www.youtube.com/watch?v=BLFllFtPD8k
  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <PaddedContentView>
          <Text style={styles.text} variant={'displayLarge'}>
            Welcome to Twitarr!
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text style={styles.text}>The un/semi-official on-board social media platform of the JoCo Cruise.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <AppImage
            mode={'scaledimage'}
            image={AppImageMetaData.fromAsset(tricordarr, 'tricordarr.jpg')}
            style={styles.image}
            disableTouch={true}
          />
        </PaddedContentView>
        <PaddedContentView>
          <Text style={styles.text} variant={'labelLarge'}>
            Version {DeviceInfo.getVersion()} (Build {DeviceInfo.getBuildNumber()}){'\n'}
            {__DEV__ ? 'Development Mode' : undefined}
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView
        rightOnPress={() => navigation.push(OobeStackComponents.oobeServerScreen)}
        leftOnPress={onPreRegistrationPress}
        leftButtonColor={theme.colors.twitarrNeutralButton}
        leftText={'Pre-Registration'}
        leftDisabled={!preRegistrationAvailable}
        leftButtonTextColor={theme.colors.onTwitarrNeutralButton}
      />
    </AppView>
  );
};
