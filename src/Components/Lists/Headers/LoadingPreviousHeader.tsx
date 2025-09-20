import React from 'react';
import {Text} from 'react-native-paper';

import {FlexCenteredContentView} from '#src/Components/Views/Content/FlexCenteredContentView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';

export const LoadingPreviousHeader = () => {
  return (
    <PaddedContentView padTop={true}>
      <FlexCenteredContentView>
        <Text variant={'labelMedium'}>Loading previous...</Text>
      </FlexCenteredContentView>
    </PaddedContentView>
  );
};
