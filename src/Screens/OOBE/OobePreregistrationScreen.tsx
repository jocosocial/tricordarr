import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {createLogger} from '#src/Libraries/Logger';
import {MainStackComponents} from '#src/Navigation/Stacks/MainStackNavigator';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';
import {RootStackComponents, useRootStack} from '#src/Navigation/Stacks/RootStackNavigator';
import {BottomTabComponents} from '#src/Navigation/Tabs/BottomTabNavigator';
import {TokenStringData} from '#src/Structs/ControllerStructs';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

const logger = createLogger('OobePreregistrationScreen.tsx');

// @ts-ignore
import tricordarr from '#assets/PlayStore/tricordarr.jpg';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobePreregistrationScreen>;

export const OobePreregistrationScreen = ({navigation, route}: Props) => {
  const {commonStyles} = useStyles();
  const {currentSession, updateSession, signIn} = useSession();
  const rootNavigation = useRootStack();
  const {appConfig} = useConfig();
  const {oobeCompleted} = useOobe();
  const [sessionServerURL, setSessionServerURL] = React.useState(appConfig.preRegistrationServerUrl);
  const [sessionTokenData, setSessionTokenData] = React.useState<TokenStringData | null>(null);

  const styles = StyleSheet.create({
    text: commonStyles.textCenter,
    boldText: {
      ...commonStyles.bold,
      ...commonStyles.textCenter,
    },
    image: commonStyles.roundedBorderLarge,
  });

  const onPress = async () => {
    if (!currentSession) {
      logger.warn('Cannot update session: no current session');
      return;
    }
    // Store some current session data so we can restore it if we go back.
    setSessionServerURL(currentSession.serverUrl);
    setSessionTokenData(currentSession.tokenData);
    // Update current session to production mode
    const useOnboardingServerUrl = route.params?.intent === 'onboarding' || !oobeCompleted;
    await updateSession(currentSession.sessionID, {
      // When intent is onboarding, always use appConfig.serverUrl
      // Otherwise preserve existing server URL when re-running OOBE after completion
      ...(useOnboardingServerUrl ? {serverUrl: appConfig.serverUrl} : {}),
      preRegistrationMode: false,
    });
    navigation.push(OobeStackComponents.oobeServerScreen);
  };

  const onBackPress = async () => {
    if (!currentSession) {
      logger.warn('Cannot update session: no current session');
      return;
    }
    // Update current session server URL to whatever it was using before.
    await updateSession(currentSession.sessionID, {
      serverUrl: sessionServerURL,
      preRegistrationMode: true,
    });
    if (sessionTokenData) {
      await signIn(sessionTokenData);
    }
    // This animation still doesn't look great, but it's good enough.
    rootNavigation.setOptions({animationTypeForReplace: 'pop'});
    rootNavigation.replace(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.homeTab,
      params: {
        screen: MainStackComponents.mainScreen,
      },
    });
  };

  return (
    <AppView disablePreRegistrationWarning={true}>
      <ScrollingContentView isStack={false}>
        <PaddedContentView>
          <Text style={styles.text} variant={'displayLarge'}>
            Welcome Aboard!
          </Text>
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
          <Text style={styles.boldText}>Do not proceed until you are physically on the ship!</Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text style={styles.text}>
            Ensure that your phone is in airplane mode, on ship WiFi, and you have disabled any VPNs, private DNS, or
            other network blockers.
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView leftText={'Back to App'} leftOnPress={onBackPress} rightOnPress={onPress} />
    </AppView>
  );
};
