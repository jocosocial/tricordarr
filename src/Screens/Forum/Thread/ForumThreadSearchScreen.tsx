import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {ForumThreadSearchBar} from '#src/Components/Search/ForumThreadSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';

export type Props = StackScreenProps<ForumStackParamList, ForumStackComponents.forumThreadSearchScreen>;

export const ForumThreadSearchScreen = (props: Props) => {
  return (
    <DisabledFeatureScreen feature={SwiftarrFeature.forums} urlPath={'/forums'}>
      <ForumThreadSearchScreenInner {...props} />
    </DisabledFeatureScreen>
  );
};

const ForumThreadSearchScreenInner = ({route}: Props) => {
  return (
    <AppView>
      {route.params.category && <ListTitleView title={route.params.category.title} />}
      <ForumThreadSearchBar category={route.params.category} />
    </AppView>
  );
};
