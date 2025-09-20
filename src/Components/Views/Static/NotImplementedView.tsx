import React from 'react';
import {Text} from 'react-native-paper';

import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';

interface NotImplementedViewProps {
  additionalText?: string;
}

export const NotImplementedView = (props: NotImplementedViewProps) => {
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>This feature is not yet implemented.</Text>
          {props.additionalText && <Text>{props.additionalText}</Text>}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
