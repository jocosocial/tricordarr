import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {CategoryData} from '#src/Structs/ControllerStructs';
import {Optional, WithElevation, WithScrollToTopIntent} from '#src/Types/RouteParams';

export type ForumStackParamList = CommonStackParamList & {
  ForumCategoriesScreen: undefined;
  ForumCategoryScreen: WithScrollToTopIntent<{
    categoryID: string;
  }>;
  ForumPostMentionScreen: Optional<WithElevation>;
  ForumPostSelfScreen: Optional<WithScrollToTopIntent>;
  ForumPostFavoriteScreen: undefined;
  ForumFavoritesScreen: Optional<WithScrollToTopIntent>;
  ForumMutesScreen: Optional<WithScrollToTopIntent>;
  ForumOwnedScreen: Optional<WithScrollToTopIntent>;
  ForumRecentScreen: Optional<WithScrollToTopIntent>;
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

export const useForumStackNavigation = () => useNavigation<StackNavigationProp<ForumStackParamList>>();

export const useForumStackRoute = () => useRoute<RouteProp<ForumStackParamList>>();
