import React from 'react';
import {AppView} from '#src/Components/Views/AppView';
import {ForumThreadSearchBar} from '#src/Components/Search/ForumThreadSearchBar';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator';
import {ListTitleView} from '#src/Components/Views/ListTitleView';

export type Props = NativeStackScreenProps<ForumStackParamList, ForumStackComponents.forumThreadSearchScreen>;

export const ForumThreadSearchScreen = ({route}: Props) => {
  return (
    <AppView>
      {route.params.category && <ListTitleView title={route.params.category.title} />}
      <ForumThreadSearchBar category={route.params.category} />
    </AppView>
  );
};
