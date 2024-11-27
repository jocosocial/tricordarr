import {FlexCenteredContentView} from '../../Views/Content/FlexCenteredContentView.tsx';
import {Text} from 'react-native-paper';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import React from 'react';

export const FezPostListHeader = () => {
  return (
    <PaddedContentView padTop={true}>
      <FlexCenteredContentView>
        <Text variant={'labelMedium'}>You've reached the beginning of this conversation.</Text>
      </FlexCenteredContentView>
    </PaddedContentView>
  );
};