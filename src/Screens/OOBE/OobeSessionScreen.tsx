import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {Text} from 'react-native-paper';

import {AnonymousSessionView} from '#src/Components/Views/AnonymousSessionView';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {SignedInAccountView} from '#src/Components/Views/SignedInAccountView';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {MainStackComponents} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {RootStackComponents, useRootStack} from '#src/Navigation/Stacks/Root/RootStackComponents';
import {BottomTabComponents} from '#src/Navigation/Tabs/Bottom/BottomTabComponents';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeSessionScreen>;

/**
 * The step after every setup flow's commit: shows the session it ended up in, signed in or not,
 * before carrying on. Account changes are left to Settings > Accounts.
 */
export const OobeSessionScreen = ({navigation, route}: Props) => {
  const {mode} = route.params;
  const {currentAccount, currentSession} = useSession();
  const {setResumeMode} = useOobe();
  const rootNavigation = useRootStack();
  const serverUrl = currentSession?.serverUrl ?? '';

  // This is the first screen when setup resumes after creating its session; that step cannot be
  // undone from here, so there is nothing to go back to. The button stays, disabled.
  const canGoBack = navigation.canGoBack();

  /**
   * Adding an account ends here; the other modes go on to permissions and finish.
   */
  const onNextPress = () => {
    if (mode === 'addAccount') {
      setResumeMode(null);
      // Nothing remounted (the session was already the one chosen), so the app is still underneath.
      if (rootNavigation.canGoBack()) {
        rootNavigation.goBack();
        return;
      }
      rootNavigation.replace(RootStackComponents.rootContentScreen, {
        screen: BottomTabComponents.homeTab,
        params: {
          screen: MainStackComponents.mainScreen,
        },
      });
      return;
    }
    navigation.push(OobeStackComponents.oobePermissionsScreen);
  };

  return (
    <AppView disablePreRegistrationWarning={true}>
      <ScrollingContentView isStack={true}>
        {currentAccount ? (
          <SignedInAccountView account={currentAccount} serverUrl={serverUrl} />
        ) : (
          <AnonymousSessionView serverUrl={serverUrl} />
        )}
        <PaddedContentView>
          <Text>You can sign in, sign out, or add another account at any time from Settings &gt; Accounts.</Text>
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        leftDisabled={!canGoBack}
        rightText={mode === 'addAccount' ? 'Done' : 'Next'}
        rightOnPress={onNextPress}
      />
    </AppView>
  );
};
