import React from 'react';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {RootStackComponents, useRootStack} from '#src/Navigation/Stacks/Root/RootStackComponents';

export const OobeSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {oobeCompletedVersion, setOobeCompletedVersion} = useOobe();
  const navigation = useRootStack();
  const {theme} = useAppTheme();

  async function resetOobeVersion() {
    await setOobeCompletedVersion(0);
  }

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSubheader>Config</ListSubheader>
        <DataFieldListItem title={'Expected'} description={String(appConfig.oobeExpectedVersion)} />
        <DataFieldListItem title={'Completed'} description={String(oobeCompletedVersion)} />
        <PaddedContentView>
          <PrimaryActionButton testID={'reset-button'} buttonText={'Reset'} onPress={resetOobeVersion} />
        </PaddedContentView>
        <ListSubheader>Welcome Card</ListSubheader>
        <DataFieldListItem title={'Dismissed'} description={String(appConfig.dismissWelcomeAboard)} />
        <PaddedContentView>
          <PrimaryActionButton
            testID={'reenableWelcomeCard-button'}
            buttonText={'Re-enable Welcome Card'}
            onPress={() => updateAppConfig({...appConfig, dismissWelcomeAboard: false})}
          />
        </PaddedContentView>
        <ListSubheader>Debugging</ListSubheader>
        <PaddedContentView padTop={true}>
          <PrimaryActionButton
            testID={'enterOOBE-button'}
            buttonText={'Enter OOBE'}
            buttonColor={theme.colors.twitarrNeutralButton}
            onPress={() => navigation.push(RootStackComponents.oobeNavigator)}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
