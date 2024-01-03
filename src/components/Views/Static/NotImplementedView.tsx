import React from 'react';
import {Text} from 'react-native-paper';
import {AppView} from '../AppView';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {PaddedContentView} from '../Content/PaddedContentView';

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
