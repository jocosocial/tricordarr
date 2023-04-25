import React from 'react';
import {Text} from 'react-native-paper';
import {AppView} from '../AppView';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {PaddedContentView} from '../Content/PaddedContentView';

export const NotImplementedView = () => {
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>This feature is not yet implemented.</Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
