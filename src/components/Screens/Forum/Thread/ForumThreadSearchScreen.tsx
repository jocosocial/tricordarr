import React from 'react';
import {AppView} from '../../../Views/AppView';
import {ForumThreadSearchBar} from '../../../Search/ForumThreadSearchBar';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../../Navigation/Stacks/ForumStackNavigator.tsx';
import {ForumStackComponents} from '../../../../libraries/Enums/Navigation.ts';

export type Props = NativeStackScreenProps<ForumStackParamList, ForumStackComponents.forumThreadSearchScreen>;

export const ForumThreadSearchScreen = ({route}: Props) => {
  return (
    <AppView>
      <ForumThreadSearchBar categoryID={route.params.categoryID} />
    </AppView>
  );
};
