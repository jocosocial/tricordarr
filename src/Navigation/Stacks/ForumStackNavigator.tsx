import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack';
import React from 'react';

import {DisabledView} from '#src/Components/Views/Static/DisabledView';
import {useDrawer} from '#src/Context/Contexts/DrawerContext';
import {useFeature} from '#src/Context/Contexts/FeatureContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonScreens, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {ForumCategoriesScreen} from '#src/Screens/Forum/ForumCategoriesScreen';
import {ForumCategoryScreen} from '#src/Screens/Forum/ForumCategoryScreen';
import {ForumPostAlertwordScreen} from '#src/Screens/Forum/Post/ForumPostAlertwordScreen';
import {ForumPostFavoriteScreen} from '#src/Screens/Forum/Post/ForumPostFavoriteScreen';
import {ForumPostMentionScreen} from '#src/Screens/Forum/Post/ForumPostMentionScreen';
import {ForumPostSelfScreen} from '#src/Screens/Forum/Post/ForumPostSelfScreen';
import {ForumThreadCreateScreen} from '#src/Screens/Forum/Thread/ForumThreadCreateScreen';
import {ForumThreadFavoritesScreen} from '#src/Screens/Forum/Thread/ForumThreadFavoritesScreen';
import {ForumThreadMutesScreen} from '#src/Screens/Forum/Thread/ForumThreadMutesScreen';
import {ForumThreadOwnedScreen} from '#src/Screens/Forum/Thread/ForumThreadOwnedScreen';
import {ForumThreadRecentScreen} from '#src/Screens/Forum/Thread/ForumThreadRecentScreen';
import {ForumThreadSearchScreen} from '#src/Screens/Forum/Thread/ForumThreadSearchScreen';
import {CategoryData} from '#src/Structs/ControllerStructs';

export type ForumStackParamList = CommonStackParamList & {
  ForumCategoriesScreen: undefined;
  ForumCategoryScreen: {
    category: CategoryData;
  };
  ForumPostMentionScreen: undefined;
  ForumPostSelfScreen: undefined;
  ForumPostFavoriteScreen: undefined;
  ForumFavoritesScreen: undefined;
  ForumMutesScreen: undefined;
  ForumOwnedScreen: undefined;
  ForumRecentScreen: undefined;
  ForumPostAlertwordScreen: {
    alertWord: string;
  };
  ForumThreadSearchScreen: {
    category?: CategoryData;
  };
  ForumThreadCreateScreen: {
    categoryId: string;
  };
};

export enum ForumStackComponents {
  forumCategoriesScreen = 'ForumCategoriesScreen',
  forumCategoryScreen = 'ForumCategoryScreen',
  forumPostMentionScreen = 'ForumPostMentionScreen',
  forumPostSelfScreen = 'ForumPostSelfScreen',
  forumPostFavoriteScreen = 'ForumPostFavoriteScreen',
  forumFavoritesScreen = 'ForumFavoritesScreen',
  forumMutesScreen = 'ForumMutesScreen',
  forumOwnedScreen = 'ForumOwnedScreen',
  forumRecentScreen = 'ForumRecentScreen',
  forumThreadSearchScreen = 'ForumThreadSearchScreen',
  forumThreadCreateScreen = 'ForumThreadCreateScreen',
  forumPostAlertwordScreen = 'ForumPostAlertwordScreen',
}

export const ForumStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createStackNavigator<ForumStackParamList>();
  const {getLeftMainHeaderButtons} = useDrawer();
  const {getIsDisabled} = useFeature();
  const isDisabled = getIsDisabled(SwiftarrFeature.forums);

  return (
    <Stack.Navigator
      initialRouteName={ForumStackComponents.forumCategoriesScreen}
      screenOptions={{...screenOptions, headerShown: true}}>
      <Stack.Screen
        name={ForumStackComponents.forumCategoriesScreen}
        component={isDisabled ? DisabledView : ForumCategoriesScreen}
        options={{
          headerLeft: getLeftMainHeaderButtons,
          title: 'Forum Categories',
        }}
      />
      <Stack.Screen
        name={ForumStackComponents.forumCategoryScreen}
        component={isDisabled ? DisabledView : ForumCategoryScreen}
        options={{
          title: 'Forums',
        }}
      />
      <Stack.Screen
        name={ForumStackComponents.forumPostMentionScreen}
        component={isDisabled ? DisabledView : ForumPostMentionScreen}
        options={{title: 'Posts Mentioning You'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumPostSelfScreen}
        component={isDisabled ? DisabledView : ForumPostSelfScreen}
        options={{title: 'Your Posts'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumPostFavoriteScreen}
        component={isDisabled ? DisabledView : ForumPostFavoriteScreen}
        options={{title: 'Favorite Posts'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumFavoritesScreen}
        component={isDisabled ? DisabledView : ForumThreadFavoritesScreen}
        options={{title: 'Favorite Forums'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumMutesScreen}
        component={isDisabled ? DisabledView : ForumThreadMutesScreen}
        options={{title: 'Muted Forums'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumOwnedScreen}
        component={isDisabled ? DisabledView : ForumThreadOwnedScreen}
        options={{title: 'Your Forums'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumRecentScreen}
        component={isDisabled ? DisabledView : ForumThreadRecentScreen}
        options={{title: 'Recently Viewed'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumThreadSearchScreen}
        component={isDisabled ? DisabledView : ForumThreadSearchScreen}
        options={{title: 'Forum Search'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumThreadCreateScreen}
        component={isDisabled ? DisabledView : ForumThreadCreateScreen}
        options={{title: 'New Forum'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumPostAlertwordScreen}
        component={ForumPostAlertwordScreen}
        options={{title: 'Alert Keyword'}}
      />
      {CommonScreens(Stack)}
    </Stack.Navigator>
  );
};

export const useForumStackNavigation = () => useNavigation<StackNavigationProp<ForumStackParamList>>();

export const useForumStackRoute = () => useRoute<RouteProp<ForumStackParamList>>();
