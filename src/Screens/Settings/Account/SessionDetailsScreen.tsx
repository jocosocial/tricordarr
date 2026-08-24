import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo} from 'react';
import {ScrollView, View} from 'react-native';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {alertDeleteSession} from '#src/Libraries/Alerts/AuthAlerts';
import {createLogger} from '#src/Libraries/Logger';
import {
  SettingsStackParamList,
  SettingsStackScreenComponents,
} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';

const logger = createLogger('SessionDetailsScreen.tsx');

type Props = StackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.sessionDetails>;
export const SessionDetailsScreen = ({route, navigation}: Props) => {
  const {sessionID} = route.params;
  const {sessions, deleteSession} = useSession();
  const {theme} = useAppTheme();

  const session = useMemo(() => {
    return sessions.find(s => s.sessionID === sessionID);
  }, [sessions, sessionID]);

  useEffect(() => {
    // If session not found, navigate back
    if (!session && sessions.length > 0) {
      navigation.goBack();
    }
  }, [session, sessions.length, navigation]);

  const handleDelete = () => {
    if (!session) {
      return;
    }
    alertDeleteSession(async () => {
      try {
        await deleteSession(sessionID);
        navigation.goBack();
      } catch (error) {
        logger.error('Error deleting session:', error);
      }
    });
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
            description={session.preRegistrationMode ? 'true' : 'false'}
          />
          <DataFieldListItem title={'Created At'} description={formatDate(session.createdAt)} />
          <DataFieldListItem title={'Last Used At'} description={formatDate(session.lastUsedAt)} />
          {session.oobeCompletedVersion !== undefined && (
            <DataFieldListItem title={'OOBE Completed Version'} description={session.oobeCompletedVersion.toString()} />
          )}
        </View>
        {session.tokenData && (
          <View>
            <ListSubheader>Token Data</ListSubheader>
            <DataFieldListItem title={'User ID'} description={session.tokenData.userID} />
            <DataFieldListItem title={'Access Level'} description={session.tokenData.accessLevel} />
            <DataFieldListItem title={'Token'} description={session.tokenData.token} sensitive={true} />
          </View>
        )}
        {!session.tokenData && (
          <View>
            <ListSubheader>Token Data</ListSubheader>
            <DataFieldListItem title={'Token'} description={'No token data'} />
          </View>
        )}
        <PaddedContentView>
          <PrimaryActionButton
            testID={'delete-button'}
            buttonColor={theme.colors.twitarrNegativeButton}
            buttonText={'Delete'}
            onPress={handleDelete}
          />
        </PaddedContentView>
      </ScrollView>
    </AppView>
  );
};
