import {FlexCenteredContentView} from '#src/Components/Views/Content/FlexCenteredContentView';
import {Text} from 'react-native-paper';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import React from 'react';

export const LoadingPreviousHeader = () => {
  return (
    <PaddedContentView padTop={true}>
      <FlexCenteredContentView>
        <Text variant={'labelMedium'}>Loading previous...</Text>
      </FlexCenteredContentView>
    </PaddedContentView>
  );
};
