import {FlexCenteredContentView} from '#src/Components/Views/Content/FlexCenteredContentView.tsx';
import {Text} from 'react-native-paper';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView.tsx';
import React from 'react';

export const ForumPostListHeader = () => {
  return (
    <PaddedContentView padTop={true}>
      <FlexCenteredContentView>
        <Text variant={'labelMedium'}>You've reached the beginning of this Forum thread.</Text>
      </FlexCenteredContentView>
    </PaddedContentView>
  );
};
