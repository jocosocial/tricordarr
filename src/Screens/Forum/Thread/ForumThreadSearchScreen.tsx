import React from 'react';
import {AppView} from '../../../Views/AppView.tsx';
import {ForumThreadSearchBar} from '../../../Search/ForumThreadSearchBar.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, ForumStackParamList} from '../../../Navigation/Stacks/ForumStackNavigator.tsx';
import {ListTitleView} from '../../../Views/ListTitleView.tsx';

export type Props = NativeStackScreenProps<ForumStackParamList, ForumStackComponents.forumThreadSearchScreen>;

export const ForumThreadSearchScreen = ({route}: Props) => {
  return (
    <AppView>
      {route.params.category && <ListTitleView title={route.params.category.title} />}
      <ForumThreadSearchBar category={route.params.category} />
    </AppView>
  );
};
