import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useAppImage} from '#src/Context/Contexts/AppImageContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';

// @ts-ignore
import tricordarr from '#assets/PlayStore/tricordarr.jpg';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeWelcomeScreen>;

const VERSION_TAPS_TO_FAULT = 10;

export const OobeWelcomeScreen = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const {currentSession, findOrCreateSession} = useSession();
  const {appConfig} = useConfig();
  const {fromAsset} = useAppImage();
  const [versionTapCount, setVersionTapCount] = useState(0);
  const [fault, setFault] = useState(false);

  if (fault) {
    throw Error("Intentional critical fault. I hope you know what you're doing.");
  }

  const styles = StyleSheet.create({
    text: commonStyles.textCenter,
    image: commonStyles.roundedBorderLarge,
  });

  // Ensure a session exists on mount - create default production session if needed
  useEffect(() => {
    const initializeSession = async () => {
      if (!currentSession) {
        await findOrCreateSession(appConfig.serverUrl, false);
      }
    };
    initializeSession();
  }, [currentSession, findOrCreateSession, appConfig.serverUrl]);

  const isInitializing = !currentSession;

  const onPress = () => {
    navigation.push(OobeStackComponents.oobeLocationScreen);
  };

  const onVersionPress = () => {
    const next = versionTapCount + 1;
    setVersionTapCount(next);
    if (next >= VERSION_TAPS_TO_FAULT) {
      setFault(true);
    }
  };

  // preRegistrationMode is no longer set from this screen. It's derived on OobeServerScreen
  // from the server's own ClientSettingsData.enablePreregistration once a server URL is
  // chosen, rather than from which button the user tapped here.

  // Un/Semi came from Drew in https://www.youtube.com/watch?v=BLFllFtPD8k
  return (
    <AppView disablePreRegistrationWarning={true}>
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
            image={fromAsset(tricordarr, 'tricordarr.jpg')}
            style={styles.image}
            disableTouch={true}
          />
        </PaddedContentView>
        <PaddedContentView>
          <Pressable onPress={onVersionPress}>
            <Text style={styles.text} variant={'labelLarge'}>
              Version {DeviceInfo.getVersion()} (Build {DeviceInfo.getBuildNumber()}){'\n'}
              {__DEV__ ? 'Development Mode' : undefined}
            </Text>
          </Pressable>
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView rightOnPress={onPress} rightDisabled={isInitializing} />
    </AppView>
  );
};
