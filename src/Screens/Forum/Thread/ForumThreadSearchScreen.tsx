import React from 'react';
import {AppView} from '#src/Views/AppView.tsx';
import {ForumThreadSearchBar} from '#src/Search/ForumThreadSearchBar.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator.tsx';
import {ListTitleView} from '#src/Views/ListTitleView.tsx';

export type Props = NativeStackScreenProps<ForumStackParamList, ForumStackComponents.forumThreadSearchScreen>;

export const ForumThreadSearchScreen = ({route}: Props) => {
  return (
    <AppView>
      {route.params.category && <ListTitleView title={route.params.category.title} />}
      <ForumThreadSearchBar category={route.params.category} />
    </AppView>
  );
};
