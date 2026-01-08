import React from 'react';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {RootStackComponents, useRootStack} from '#src/Navigation/Stacks/RootStackNavigator';

export const OobeSettingsScreen = () => {
  const {appConfig} = useConfig();
  const {currentSession, updateSession} = useSession();
  const navigation = useRootStack();
  const {theme} = useAppTheme();

  async function resetOobeVersion() {
    if (!currentSession) {
      return;
    }
    await updateSession(currentSession.sessionID, {
      oobeCompletedVersion: 0,
    });
  }

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSubheader>Config</ListSubheader>
        <DataFieldListItem title={'Expected'} description={String(appConfig.oobeExpectedVersion)} />
        <DataFieldListItem title={'Completed'} description={String(currentSession?.oobeCompletedVersion ?? 0)} />
        <PaddedContentView>
          <PrimaryActionButton buttonText={'Reset'} onPress={resetOobeVersion} />
        </PaddedContentView>
        <ListSubheader>Debugging</ListSubheader>
        <PaddedContentView padTop={true}>
          <PrimaryActionButton
            buttonText={'Enter OOBE'}
            buttonColor={theme.colors.twitarrNeutralButton}
            onPress={() => navigation.push(RootStackComponents.oobeNavigator)}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
