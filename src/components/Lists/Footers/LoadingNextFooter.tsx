import {FlexCenteredContentView} from '../../Views/Content/FlexCenteredContentView.tsx';
import {Text} from 'react-native-paper';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import React from 'react';
import {ListHeaderInvertProp} from '../../../libraries/Types';

export const LoadingNextFooter = (props: ListHeaderInvertProp) => {
  return (
    <PaddedContentView padTop={true} invertVertical={props.invertList}>
      <FlexCenteredContentView>
        <Text variant={'labelMedium'}>Loading next...</Text>
      </FlexCenteredContentView>
    </PaddedContentView>
  );
};
