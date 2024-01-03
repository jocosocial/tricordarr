import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {Text} from 'react-native-paper';

export const MainHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>HELP</Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
