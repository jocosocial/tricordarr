import React from 'react';
import {AppView} from '../../Views/AppView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SeamailSearchBar} from '../../Search/SeamailSearchBar';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ChatStackParamList} from '../../Navigation/Stacks/ChatStackNavigator.tsx';
import {ChatStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {NotImplementedView} from '../../Views/Static/NotImplementedView';

type SeamailSearchScreenProps = NativeStackScreenProps<
  ChatStackParamList,
  ChatStackScreenComponents.seamailSearchScreen
>;

export const SeamailSearchScreen = ({route}: SeamailSearchScreenProps) => {
  if (route.params.forUser) {
    const text = `Seamail search is available for user accounts, not for privileged accounts like ${route.params.forUser}.`;
    return <NotImplementedView additionalText={text} />;
  }
  return (
    <AppView>
      <PaddedContentView padSides={false}>
        <SeamailSearchBar />
      </PaddedContentView>
    </AppView>
  );
};
