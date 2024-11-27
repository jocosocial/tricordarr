import {FlexCenteredContentView} from '../../Views/Content/FlexCenteredContentView.tsx';
import {Text} from 'react-native-paper';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import React from 'react';

export const EndResultsFooter = () => {
  return (
    <PaddedContentView>
      <FlexCenteredContentView>
        <Text variant={'labelMedium'}>End of Results</Text>
      </FlexCenteredContentView>
    </PaddedContentView>
  );
};
