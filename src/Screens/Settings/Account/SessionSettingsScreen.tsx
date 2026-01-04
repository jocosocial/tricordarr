import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';

import {MinorActionListItem} from '#src/Components/Lists/Items/MinorActionListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AppIcons} from '#src/Enums/Icons';
import {
  SettingsStackParamList,
  SettingsStackScreenComponents,
  useSettingsStack,
} from '#src/Navigation/Stacks/SettingsStackNavigator';

type Props = StackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.sessionSettings>;
export const SessionSettingsScreen = () => {
  const settingsNavigation = useSettingsStack();
  const {sessions, currentSessionID} = useSession();

  const formatSessionDescription = (serverUrl: string, preRegistrationMode: boolean) => {
    return `${serverUrl} (preRegistrationMode: ${preRegistrationMode})`;
  };

  const formatSessionTitle = (sessionID: string) => {
    // Show first 8 characters of UUID for readability
    return sessionID.substring(0, 8);
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padSides={false}>
          <ListSection>
            <ListSubheader>Sessions</ListSubheader>
            {sessions.length === 0 ? (
              <View>
                <MinorActionListItem
                  title={'No sessions'}
                  icon={AppIcons.info}
                  onPress={() => {}}
                  description={'No sessions found'}
                />
              </View>
            ) : (
              sessions.map(session => (
                <MinorActionListItem
                  key={session.sessionID}
                  title={formatSessionTitle(session.sessionID)}
                  icon={AppIcons.session}
                  description={formatSessionDescription(session.serverUrl, session.preRegistrationMode)}
                  onPress={() =>
                    settingsNavigation.push(SettingsStackScreenComponents.sessionDetails, {
                      sessionID: session.sessionID,
                    })
                  }
                />
              ))
            )}
          </ListSection>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
