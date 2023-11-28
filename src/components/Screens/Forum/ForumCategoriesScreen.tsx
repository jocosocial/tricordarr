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
import {ForumCategoryFAB} from '../../Buttons/FloatingActionButtons/ForumCategoryFAB';
import {ForumCategoryListItemBase} from '../../Lists/Items/Forum/ForumCategoryListItemBase';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {ForumMentionsCategoryListItem} from '../../Lists/Items/Forum/ForumMentionsCategoryListItem';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {ForumStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumCategoriesScreen,
  NavigatorIDs.forumStack
>;

export const ForumCategoriesScreen = ({navigation}: Props) => {
  const {data, refetch, isLoading} = useForumCategoriesQuery();
  const {forumCategories, setForumCategories} = useTwitarr();
  const [refreshing, setRefreshing] = useState(false);
  const {refetchUserNotificationData} = useUserNotificationData();
  const {isLoggedIn} = useAuth();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => refetchUserNotificationData().then(() => setRefreshing(false)));
  }, [refetch, refetchUserNotificationData]);

  useEffect(() => {
    if (data) {
      setForumCategories(data);
    }
  }, [data, setForumCategories]);

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh || isLoading} />}>
        <View>
          <ListSection>
            <List.Subheader>Forum Categories</List.Subheader>
            {forumCategories.map((category, index) => {
              return (
                <React.Fragment key={category.categoryID}>
                  {index === 0 && <Divider bold={true} />}
                  <ForumCategoryListItem category={category} />
                  <Divider bold={true} />
                </React.Fragment>
              );
            })}
          </ListSection>
          <ListSection>
            <List.Subheader>Personal Categories</List.Subheader>
            <Divider bold={true} />
            <ForumCategoryListItemBase
              title={'Favorite Forums'}
              onPress={() => console.log('fav')}
              description={'Forums that you have favorited for easy access.'}
            />
            <Divider bold={true} />
            <ForumCategoryListItemBase
              title={'Recent Forums'}
              onPress={() => console.log('recent')}
              description={'Forums that you have been active in recently.'}
            />
            <Divider bold={true} />
            <ForumCategoryListItemBase
              title={'Your Forums'}
              onPress={() => console.log('yours')}
              description={'Forums that you created.'}
            />
            <Divider bold={true} />
            <ForumCategoryListItemBase
              title={'Muted Forums'}
              onPress={() => console.log('muted')}
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
        </View>
      </ScrollingContentView>
      <ForumCategoryFAB />
    </AppView>
  );
};
