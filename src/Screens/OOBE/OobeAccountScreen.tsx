import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {Text} from 'react-native-paper';

import {MinorActionListItem} from '#src/Components/Lists/Items/MinorActionListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AccountChoiceView} from '#src/Components/Views/AccountChoiceView';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {SignedInAccountView} from '#src/Components/Views/SignedInAccountView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSignOut} from '#src/Context/Contexts/SignOutContext';
import {AppIcons} from '#src/Enums/Icons';
import {useOnboardingCommit} from '#src/Hooks/useOnboardingCommit';
import {createLogger} from '#src/Libraries/Logger';
import {normalizeServerUrl} from '#src/Libraries/ServerUrl';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';

const logger = createLogger('OobeAccountScreen.tsx');

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeAccountScreen>;

/**
 * Last step before the setup flow commits: log in, create an account, or proceed without one on
 * the chosen server. Log in and create (by way of the code of conduct) run their own screens and
 * commit there; proceeding commits here. Boarding passes the pre-registration username on to the
 * login form. When setup is re-run on a server the user is already signed in to, there is nothing to
 * choose and it confirms the account instead.
 */
export const OobeAccountScreen = ({navigation, route}: Props) => {
  const {mode} = route.params;
  const serverUrl = normalizeServerUrl(route.params.serverUrl);
  const {isLoggedIn, currentAccount, currentSession} = useSession();
  const {appConfig} = useConfig();
  const {confirmLogout} = useSignOut();
  const {commitAnonymous} = useOnboardingCommit(mode);
  const [busy, setBusy] = useState(false);

  const onThisServer = currentSession?.serverUrl === serverUrl;
  const confirmAccount = mode === 'firstRun' && onThisServer && isLoggedIn && !!currentAccount;

  // Boarding leaves the pre-registration account behind, and people forget which username they
  // registered with, so offer it on the production login form. It is empty until the first whoami.
  const boardingUsername = mode === 'boarding' ? currentAccount?.username || undefined : undefined;
  // Accounts are per year and they already have this year's, so boarding with one only offers login.
  const hadAccount = mode === 'boarding' && !!currentAccount;

  const onProceed = async () => {
    // Already browsing this server without an account: there is no session to change.
    if (onThisServer && !isLoggedIn) {
      navigation.push(OobeStackComponents.oobeSessionScreen, {mode});
      return;
    }
    setBusy(true);
    try {
      await commitAnonymous(serverUrl);
    } catch (error) {
      logger.error('Failed to switch server:', error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppView disablePreRegistrationWarning={true}>
      {confirmAccount ? (
        <ScrollingContentView>
          <SignedInAccountView account={currentAccount} serverUrl={serverUrl} />
          <PaddedContentView>
            <Text>
              If this is incorrect or you wish to change accounts, you can log out below. To proceed with your current
              account, press the Next button at the bottom of the screen.
            </Text>
          </PaddedContentView>
          <PaddedContentView padSides={false}>
            <ListSection>
              <MinorActionListItem
                title={'Logout this device'}
                icon={AppIcons.logout}
                onPress={() => confirmLogout()}
              />
              <MinorActionListItem
                title={'Logout all devices'}
                icon={AppIcons.error}
                onPress={() => confirmLogout({allDevices: true})}
              />
            </ListSection>
          </PaddedContentView>
        </ScrollingContentView>
      ) : (
        <AccountChoiceView
          onCreate={() => navigation.push(OobeStackComponents.oobeRegisterConductScreen, {mode, serverUrl})}
          onLogin={() =>
            navigation.push(OobeStackComponents.oobeLoginScreen, {mode, serverUrl, username: boardingUsername})
          }
          onProceed={onProceed}
          preRegistrationMode={serverUrl === normalizeServerUrl(appConfig.preRegistrationServerUrl)}
          disabled={busy}
          hideCreate={hadAccount}
        />
      )}
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        rightOnPress={() => navigation.push(OobeStackComponents.oobeSessionScreen, {mode})}
        rightDisabled={!confirmAccount}
      />
    </AppView>
  );
};
