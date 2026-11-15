import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
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
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSecretTrigger} from '#src/Hooks/useSecretTrigger';
import {createLogger} from '#src/Libraries/Logger';
import {MainStackComponents} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {RootStackComponents, useRootStack} from '#src/Navigation/Stacks/Root/RootStackComponents';
import {BottomTabComponents} from '#src/Navigation/Tabs/Bottom/BottomTabComponents';

// @ts-ignore
import tricordarr from '#assets/PlayStore/tricordarr.jpg';

const logger = createLogger('OobeWelcomeScreen.tsx');

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeWelcomeScreen>;

/**
 * First screen of first-run setup. No session exists yet; the account step creates it.
 */
export const OobeWelcomeScreen = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const {currentSession, switchToServer} = useSession();
  const {appConfig} = useConfig();
  const {oobeFinish} = useOobe();
  const {fromAsset} = useAppImage();
  const rootNavigation = useRootStack();

  const styles = StyleSheet.create({
    text: commonStyles.textCenter,
    image: commonStyles.roundedBorderLarge,
  });

  const onPress = () => {
    navigation.push(OobeStackComponents.oobeLocationScreen);
  };

  // Secret escape hatch, formerly a tap-the-header-title secret (via SecretHeaderTitle) on
  // OobeServerScreen. Relocated here onto the version/build text, via the same hook, since
  // this screen no longer has a header to hang it on. Its own tap count is independent of
  // versionTapCount below, so the two secrets never interfere with each other.
  const {onPress: onVersionPress} = useSecretTrigger({
    onTrigger: () => {
      oobeFinish();
      // Skipping setup still needs a session to land in. Creating one remounts the navigators,
      // which then start in the app because setup is now complete.
      if (!currentSession) {
        switchToServer(appConfig.serverUrl).catch(error => logger.error('Failed to create session:', error));
        return;
      }
      rootNavigation.replace(RootStackComponents.rootContentScreen, {
        screen: BottomTabComponents.homeTab,
        params: {
          screen: MainStackComponents.mainScreen,
        },
      });
    },
  });

  // Pre-registration mode is not set from this screen. It is the chosen server's own
  // ClientSettingsData.enablePreregistration, recorded on its ServerProfile once a session on it
  // loads, rather than which button the user tapped here.

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
      <OobeButtonsView rightOnPress={onPress} />
    </AppView>
  );
};
