import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ForumThreadScreenSortMenu} from '#src/Components/Menus/Forum/ForumThreadScreenSortMenu';
import {AppView} from '#src/Components/Views/AppView';
import {ForumThreadsRelationsView} from '#src/Components/Views/Forum/ForumThreadsRelationsView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator';
import {ForumRelationQueryType} from '#src/Queries/Forum/ForumThreadRelationQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

type Props = StackScreenProps<ForumStackParamList, ForumStackComponents.forumOwnedScreen>;

export const ForumThreadOwnedScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.forumCategoryHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.forums} urlPath={'/forum/owned'}>
          <ForumThreadOwnedScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const ForumThreadOwnedScreenInner = ({navigation}: Props) => {
  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <ForumThreadScreenSortMenu />
        </MaterialHeaderButtons>
      </View>
    );
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <AppView>
      <ForumThreadsRelationsView relationType={ForumRelationQueryType.owner} />
    </AppView>
  );
};
