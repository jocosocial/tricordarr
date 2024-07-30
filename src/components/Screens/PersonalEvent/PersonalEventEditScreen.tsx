import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {Text} from 'react-native-paper';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.personalEventEditScreen>;
export const PersonalEventEditScreen = ({route}: Props) => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <Text>{route.params.personalEvent.title}</Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
