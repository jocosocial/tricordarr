import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, View} from 'react-native';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {accountLabel, isServerPreRegistration} from '#src/Libraries/Account';
import {alertDeleteSession, alertRemoveAccount} from '#src/Libraries/Alerts/AuthAlerts';
import {createLogger} from '#src/Libraries/Logger';
import {
  SettingsStackParamList,
  SettingsStackScreenComponents,
} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';
import {TokenStringData} from '#src/Structs/ControllerStructs';

const logger = createLogger('SessionDetailsScreen.tsx');

type Props = StackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.sessionDetails>;

/**
 * Developer screen: the raw Session, its Account and the stored token.
 */
export const SessionDetailsScreen = ({route, navigation}: Props) => {
  const {sessionID} = route.params;
  const {sessions, accounts, serverProfiles, removeAccount, removeSession, getTokenForAccount} = useSession();
  const {theme} = useAppTheme();
  const [token, setToken] = useState<TokenStringData | null>(null);
  const [busy, setBusy] = useState(false);

  const session = useMemo(() => sessions.find(s => s.sessionID === sessionID), [sessions, sessionID]);
  const account = useMemo(() => accounts.find(a => a.accountID === session?.accountID), [accounts, session?.accountID]);
  const accountID = account?.accountID;

  useEffect(() => {
    // If session not found, navigate back
    if (!session && sessions.length > 0) {
      navigation.goBack();
    }
  }, [session, sessions.length, navigation]);

  useEffect(() => {
    if (!accountID) {
      setToken(null);
      return;
    }
    getTokenForAccount(accountID)
      .then(setToken)
      .catch(error => logger.error('Error loading token:', error));
  }, [accountID, getTokenForAccount]);

  const handleDelete = () => {
    if (!session) {
      return;
    }
    const run = async () => {
      setBusy(true);
      try {
        if (account) {
          await removeAccount(account.accountID);
        } else {
          await removeSession(sessionID);
        }
        navigation.goBack();
      } catch (error) {
        logger.error('Error deleting session:', error);
      } finally {
        setBusy(false);
      }
    };
    if (account) {
      alertRemoveAccount(accountLabel(account), run);
    } else {
      alertDeleteSession(run);
    }
  };

  if (!session) {
    return (
      <AppView>
        <ScrollView>
          <PaddedContentView>
            <DataFieldListItem title={'Session'} description={'Session not found'} />
          </PaddedContentView>
        </ScrollView>
      </AppView>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <AppView>
      <ScrollView>
        <View>
          <ListSubheader>Session Information</ListSubheader>
          <DataFieldListItem title={'Session ID'} description={session.sessionID} />
          <DataFieldListItem title={'Server URL'} description={session.serverUrl} />
          <DataFieldListItem
            title={'Pre-Registration Mode'}
            description={
              isServerPreRegistration(serverProfiles.find(p => p.serverUrl === session.serverUrl)) ? 'true' : 'false'
            }
          />
          <DataFieldListItem title={'Created At'} description={formatDate(session.createdAt)} />
          <DataFieldListItem title={'Last Used At'} description={formatDate(session.lastUsedAt)} />
        </View>
        <View>
          <ListSubheader>Account</ListSubheader>
          {account ? (
            <>
              <DataFieldListItem title={'Account ID'} description={account.accountID} />
              <DataFieldListItem title={'User ID'} description={account.userID} />
              <DataFieldListItem title={'Username'} description={account.username || 'Not fetched yet'} />
              <DataFieldListItem title={'Access Level'} description={account.accessLevel} />
              <DataFieldListItem title={'Status'} description={account.status} />
              <DataFieldListItem title={'Token'} description={token?.token ?? 'No token'} sensitive={true} />
            </>
          ) : (
            <DataFieldListItem title={'Account'} description={'Anonymous session'} />
          )}
        </View>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'delete-button'}
            buttonColor={theme.colors.twitarrNegativeButton}
            buttonText={account ? 'Remove Account' : 'Delete'}
            onPress={handleDelete}
            disabled={busy}
          />
        </PaddedContentView>
      </ScrollView>
    </AppView>
  );
};
