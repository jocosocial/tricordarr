import {FlexCenteredContentView} from '#src/Components/Views/Content/FlexCenteredContentView';
import {Text} from 'react-native-paper';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import React from 'react';

export const LoadingNextFooter = () => {
  return (
    <PaddedContentView padTop={true}>
      <FlexCenteredContentView>
        <Text variant={'labelMedium'}>Loading next...</Text>
      </FlexCenteredContentView>
    </PaddedContentView>
  );
};
