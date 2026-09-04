import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {useDrawer} from '#src/Context/Contexts/DrawerContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonScreens} from '#src/Navigation/Stacks/Common/CommonScreens';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/Forum/ForumStackComponents';
import {ForumCategoriesScreen} from '#src/Screens/Forum/ForumCategoriesScreen';
import {ForumCategoryScreen} from '#src/Screens/Forum/ForumCategoryScreen';
import {ForumPostAlertwordScreen} from '#src/Screens/Forum/Post/ForumPostAlertwordScreen';
import {ForumPostFavoriteScreen} from '#src/Screens/Forum/Post/ForumPostFavoriteScreen';
import {ForumPostSelfScreen} from '#src/Screens/Forum/Post/ForumPostSelfScreen';
import {ForumThreadCreateScreen} from '#src/Screens/Forum/Thread/ForumThreadCreateScreen';
import {ForumThreadFavoritesScreen} from '#src/Screens/Forum/Thread/ForumThreadFavoritesScreen';
import {ForumThreadMutesScreen} from '#src/Screens/Forum/Thread/ForumThreadMutesScreen';
import {ForumThreadOwnedScreen} from '#src/Screens/Forum/Thread/ForumThreadOwnedScreen';
import {ForumThreadRecentScreen} from '#src/Screens/Forum/Thread/ForumThreadRecentScreen';
import {ForumThreadSearchScreen} from '#src/Screens/Forum/Thread/ForumThreadSearchScreen';

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
