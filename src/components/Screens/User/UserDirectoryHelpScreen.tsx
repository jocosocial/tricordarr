import React from 'react';
import {Text} from 'react-native-paper';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';

export const UserDirectoryHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>Directory Help!</Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
