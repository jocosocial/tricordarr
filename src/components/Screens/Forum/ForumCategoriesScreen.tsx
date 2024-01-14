import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useForumCategoriesQuery} from '../../Queries/Forum/ForumCategoryQueries';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {RefreshControl, View} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView';
import {Divider, List} from 'react-native-paper';
import {ListSection} from '../../Lists/ListSection';
import {ForumCategoryListItem} from '../../Lists/Items/Forum/ForumCategoryListItem';
import {ForumCategoryListItemBase} from '../../Lists/Items/Forum/ForumCategoryListItemBase';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {ForumMentionsCategoryListItem} from '../../Lists/Items/Forum/ForumMentionsCategoryListItem';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {
  BottomTabComponents,
  ForumStackComponents,
  MainStackComponents,
  NavigatorIDs,
  RootStackComponents,
  SettingsStackScreenComponents,
} from '../../../libraries/Enums/Navigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {useIsFocused} from '@react-navigation/native';
import {ForumPostListActions} from '../../Reducers/Forum/ForumPostListReducer';
import {ForumListDataActions} from '../../Reducers/Forum/ForumListDataReducer';
import {ForumSearchFAB} from '../../Buttons/FloatingActionButtons/ForumSearchFAB';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {ForumCategoriesScreenActionsMenu} from '../../Menus/Forum/ForumCategoriesScreenActionsMenu';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {useUserKeywordQuery} from '../../Queries/User/UserQueries';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {ForumPostAlertwordScreen} from './Post/ForumPostAlertwordScreen';
import {ForumAlertwordListItem} from '../../Lists/Items/Forum/ForumAlertwordListItem';
import {ListSubheader} from '../../Lists/ListSubheader';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumCategoriesScreen,
  NavigatorIDs.forumStack
>;

export const ForumCategoriesScreen = ({navigation}: Props) => {
  const {data, refetch, isLoading} = useForumCategoriesQuery();
  const [refreshing, setRefreshing] = useState(false);
  const {refetchUserNotificationData} = useUserNotificationData();
  const {isLoggedIn} = useAuth();
  const isFocused = useIsFocused();
  const {dispatchForumPosts, dispatchForumListData, setForumData} = useTwitarr();
  const {clearPrivileges} = usePrivilege();
  const {data: keywordData, refetch: refetchKeywordData} = useUserKeywordQuery({
    keywordType: 'alertwords',
  });
  const rootNavigation = useRootStack();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() =>
      refetchUserNotificationData().then(() => refetchKeywordData().then(() => setRefreshing(false))),
    );
  }, [refetch, refetchKeywordData, refetchUserNotificationData]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ForumCategoriesScreenActionsMenu />
        </HeaderButtons>
      </View>
    );
  }, []);

  useEffect(() => {
    // This clears the previous state of forum posts, specific forum, and the category list data.
    if (isFocused) {
      console.log('[ForumCategoriesScreen.tsx] Clearing ForumPosts, ForumList, and ForumData');
      dispatchForumPosts({
        type: ForumPostListActions.clear,
      });
      dispatchForumListData({
        type: ForumListDataActions.clear,
      });
      clearPrivileges();
      setForumData(undefined);
    }
  }, [clearPrivileges, dispatchForumListData, dispatchForumPosts, isFocused, setForumData]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh || isLoading} />}>
        <View>
          {data && (
            <ListSection>
              <ListSubheader>Forum Categories</ListSubheader>
              {data.map((category, index) => {
                return (
                  <React.Fragment key={category.categoryID}>
                    {index === 0 && <Divider bold={true} />}
                    <ForumCategoryListItem category={category} />
                    <Divider bold={true} />
                  </React.Fragment>
                );
              })}
            </ListSection>
          )}
          <ListSection>
            <ListSubheader>Personal Categories</ListSubheader>
            <Divider bold={true} />
            <ForumCategoryListItemBase
              title={'Favorite Forums'}
              onPress={() => navigation.push(ForumStackComponents.forumFavoritesScreen)}
              description={'Forums that you have favorited for easy access.'}
            />
            <Divider bold={true} />
            <ForumCategoryListItemBase
              title={'Recent Forums'}
              onPress={() => navigation.push(ForumStackComponents.forumRecentScreen)}
              description={'Forums that you have viewed recently.'}
            />
            <Divider bold={true} />
            <ForumCategoryListItemBase
              title={'Your Forums'}
              onPress={() => navigation.push(ForumStackComponents.forumOwnedScreen)}
              description={'Forums that you created.'}
            />
            <Divider bold={true} />
            <ForumCategoryListItemBase
              title={'Muted Forums'}
              onPress={() => navigation.push(ForumStackComponents.forumMutesScreen)}
              description={'Forums that you have muted.'}
            />
            <Divider bold={true} />
            <ForumMentionsCategoryListItem />
            <Divider bold={true} />
            <ForumCategoryListItemBase
              title={'Favorite Posts'}
              onPress={() => navigation.push(ForumStackComponents.forumPostFavoriteScreen)}
              description={'Posts that you have saved from forums.'}
            />
            <Divider bold={true} />
            <ForumCategoryListItemBase
              title={'Your Posts'}
              onPress={() => navigation.push(ForumStackComponents.forumPostSelfScreen)}
              description={'Posts that you have made in forums.'}
            />
            <Divider bold={true} />
          </ListSection>
          <ListSection>
            <ListSubheader>Alert Keywords</ListSubheader>
            <Divider bold={true} />
            {keywordData && keywordData.keywords.length > 0 ? keywordData.keywords.map(alertWord => {
              return (
                <React.Fragment key={alertWord}>
                  <ForumAlertwordListItem alertword={alertWord} />
                  <Divider bold={true} />
                </React.Fragment>
              );
            }) : (
              <ForumCategoryListItemBase title={'No Keywords Configured'} description={'You can configure alert and mute keywords using the menu in the upper right.'} />
            )}
          </ListSection>
        </View>
      </ScrollingContentView>
      <ForumSearchFAB />
    </AppView>
  );
};
