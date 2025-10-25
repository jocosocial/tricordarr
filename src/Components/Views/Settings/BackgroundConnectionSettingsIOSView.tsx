import {Text} from 'react-native-paper';

import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';

export const BackgroundConnectionSettingsIOSView = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSection>
          <ListSubheader>About</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <Text>In progress...</Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
