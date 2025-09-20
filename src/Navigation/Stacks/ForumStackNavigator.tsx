import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStyles} from '#src/Context/Contexts/StyleContext.ts';
import {useDrawer} from '#src/Context/Contexts/DrawerContext.ts';
import {useFeature} from '#src/Context/Contexts/FeatureContext.ts';
import {SwiftarrFeature} from '../../../Libraries/Enums/AppFeatures.ts';
import {DisabledView} from '#src/Views/Static/DisabledView.tsx';
import {ForumCategoriesScreen} from '#src/Screens/Forum/ForumCategoriesScreen.tsx';
import {ForumCategoryScreen} from '#src/Screens/Forum/ForumCategoryScreen.tsx';
import {ForumPostMentionScreen} from '#src/Screens/Forum/Post/ForumPostMentionScreen.tsx';
import {ForumPostSelfScreen} from '#src/Screens/Forum/Post/ForumPostSelfScreen.tsx';
import {ForumPostFavoriteScreen} from '#src/Screens/Forum/Post/ForumPostFavoriteScreen.tsx';
import {ForumThreadFavoritesScreen} from '#src/Screens/Forum/Thread/ForumThreadFavoritesScreen.tsx';
import {ForumThreadMutesScreen} from '#src/Screens/Forum/Thread/ForumThreadMutesScreen.tsx';
import {ForumThreadOwnedScreen} from '#src/Screens/Forum/Thread/ForumThreadOwnedScreen.tsx';
import {ForumThreadRecentScreen} from '#src/Screens/Forum/Thread/ForumThreadRecentScreen.tsx';
import {ForumThreadSearchScreen} from '#src/Screens/Forum/Thread/ForumThreadSearchScreen.tsx';
import {ForumThreadCreateScreen} from '#src/Screens/Forum/Thread/ForumThreadCreateScreen.tsx';
import {ForumPostAlertwordScreen} from '#src/Screens/Forum/Post/ForumPostAlertwordScreen.tsx';
import {CommonScreens, CommonStackParamList} from '#src/Navigation/CommonScreens.tsx';
import {MainStack} from './MainStackNavigator.tsx';
import {CategoryData} from '../../../Libraries/Structs/ControllerStructs.tsx';

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
  const Stack = createNativeStackNavigator<ForumStackParamList>();
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
      {CommonScreens(Stack as typeof MainStack)}
    </Stack.Navigator>
  );
};

export const useForumStackNavigation = () => useNavigation<NativeStackNavigationProp<ForumStackParamList>>();

export const useForumStackRoute = () => useRoute<RouteProp<ForumStackParamList>>();
