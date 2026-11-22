import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {Optional, WithElevation, WithScrollToTopIntent} from '#src/Types/RouteParams';

export type ForumStackParamList = CommonStackParamList & {
  ForumCategoriesScreen: undefined;
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
};

export enum ForumStackComponents {
  forumCategoriesScreen = 'ForumCategoriesScreen',
  forumPostMentionScreen = 'ForumPostMentionScreen',
  forumPostSelfScreen = 'ForumPostSelfScreen',
  forumPostFavoriteScreen = 'ForumPostFavoriteScreen',
  forumFavoritesScreen = 'ForumFavoritesScreen',
  forumMutesScreen = 'ForumMutesScreen',
  forumOwnedScreen = 'ForumOwnedScreen',
  forumRecentScreen = 'ForumRecentScreen',
  forumPostAlertwordScreen = 'ForumPostAlertwordScreen',
}

export const useForumStackNavigation = () => useNavigation<StackNavigationProp<ForumStackParamList>>();

export const useForumStackRoute = () => useRoute<RouteProp<ForumStackParamList>>();
