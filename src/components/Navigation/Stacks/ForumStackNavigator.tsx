import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ForumStackComponents} from '../../../libraries/Enums/Navigation';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useDrawer} from '../../Context/Contexts/DrawerContext';
import {useFeature} from '../../Context/Contexts/FeatureContext';
import {SwiftarrFeature} from '../../../libraries/Enums/AppFeatures';
import {DisabledView} from '../../Views/Static/DisabledView';
import {ForumCategoriesScreen} from '../../Screens/Forum/ForumCategoriesScreen';
import {ForumCategoryScreen} from '../../Screens/Forum/ForumCategoryScreen';
import {ForumThreadScreen} from '../../Screens/Forum/ForumThreadScreen';
import {ForumPostMentionScreen} from '../../Screens/Forum/ForumPostMentionScreen';
import {ForumPostSelfScreen} from '../../Screens/Forum/ForumPostSelfScreen';
import {ForumPostFavoriteScreen} from '../../Screens/Forum/ForumPostFavoriteScreen';

export type ForumStackParamList = {
  ForumCategoriesScreen: undefined;
  ForumCategoryScreen: {
    categoryId: string;
  };
  ForumThreadScreen: {
    forumID: string;
  };
  ForumPostMentionScreen: undefined;
  ForumPostSelfScreen: undefined;
  ForumPostFavoriteScreen: undefined;
};

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
        name={ForumStackComponents.forumThreadScreen}
        component={isDisabled ? DisabledView : ForumThreadScreen}
        options={{
          title: 'Forum',
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
    </Stack.Navigator>
  );
};

export const useForumStackNavigation = () => useNavigation<NativeStackNavigationProp<ForumStackParamList>>();

export const useForumStackRoute = () => useRoute<RouteProp<ForumStackParamList>>();
