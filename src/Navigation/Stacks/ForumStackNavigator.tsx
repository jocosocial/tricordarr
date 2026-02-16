import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack';
import React from 'react';

import {useDrawer} from '#src/Context/Contexts/DrawerContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
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
    scrollToTopIntent?: number;
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

  return (
    <Stack.Navigator
      initialRouteName={ForumStackComponents.forumCategoriesScreen}
      screenOptions={{...screenOptions, headerShown: true}}>
      <Stack.Screen
        name={ForumStackComponents.forumCategoriesScreen}
        component={ForumCategoriesScreen}
        options={{
          headerLeft: getLeftMainHeaderButtons,
          title: 'Forum Categories',
        }}
      />
      <Stack.Screen
        name={ForumStackComponents.forumCategoryScreen}
        component={ForumCategoryScreen}
        options={{
          title: 'Forums',
        }}
      />
      <Stack.Screen
        name={ForumStackComponents.forumPostMentionScreen}
        component={ForumPostMentionScreen}
        options={{title: 'Posts Mentioning You'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumPostSelfScreen}
        component={ForumPostSelfScreen}
        options={{title: 'Your Posts'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumPostFavoriteScreen}
        component={ForumPostFavoriteScreen}
        options={{title: 'Favorite Posts'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumFavoritesScreen}
        component={ForumThreadFavoritesScreen}
        options={{title: 'Favorite Forums'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumMutesScreen}
        component={ForumThreadMutesScreen}
        options={{title: 'Muted Forums'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumOwnedScreen}
        component={ForumThreadOwnedScreen}
        options={{title: 'Your Forums'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumRecentScreen}
        component={ForumThreadRecentScreen}
        options={{title: 'Recently Viewed'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumThreadSearchScreen}
        component={ForumThreadSearchScreen}
        options={{title: 'Forum Search'}}
      />
      <Stack.Screen
        name={ForumStackComponents.forumThreadCreateScreen}
        component={ForumThreadCreateScreen}
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
