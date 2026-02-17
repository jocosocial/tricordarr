import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {createLogger} from '#src/Libraries/Logger';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

const logger = createLogger('OobeWelcomeScreen.tsx');

// @ts-ignore
import tricordarr from '#assets/PlayStore/tricordarr.jpg';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeWelcomeScreen>;

export const OobeWelcomeScreen = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const {currentSession, findOrCreateSession, updateSession} = useSession();
  const {appConfig} = useConfig();
  const {theme} = useAppTheme();

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

  const onPreRegistrationPress = async () => {
    if (!currentSession) {
      logger.warn('Cannot update session: no current session');
      return;
    }
    await updateSession(currentSession.sessionID, {
      serverUrl: appConfig.preRegistrationServerUrl,
      preRegistrationMode: true,
    });
    navigation.push(OobeStackComponents.oobeServerScreen);
  };

  const onPress = async () => {
    if (!currentSession) {
      logger.warn('Cannot update session: no current session');
      return;
    }
    await updateSession(currentSession.sessionID, {
      serverUrl: appConfig.serverUrl,
      preRegistrationMode: false,
    });
    navigation.push(OobeStackComponents.oobeServerScreen);
  };

  // This used to have a useFocusEffect that would disable preregistration mode
  // which caught if you entered prereg and then changed your mind. This actually
  // sucks as a pattern so I'm turning it off and making that happen depending on
  // how you proceed.

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
        rightOnPress={onPress}
        leftOnPress={onPreRegistrationPress}
        leftButtonColor={theme.colors.twitarrNeutralButton}
        leftText={'Pre-Registration'}
        leftButtonTextColor={theme.colors.onTwitarrNeutralButton}
        rightDisabled={isInitializing}
        leftDisabled={isInitializing}
      />
    </AppView>
  );
};
