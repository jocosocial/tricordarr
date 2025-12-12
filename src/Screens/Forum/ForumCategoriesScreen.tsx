import {useIsFocused} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {Divider} from 'react-native-paper';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ForumAlertwordListItem} from '#src/Components/Lists/Items/Forum/ForumAlertwordListItem';
import {ForumCategoryListItem} from '#src/Components/Lists/Items/Forum/ForumCategoryListItem';
import {ForumCategoryListItemBase} from '#src/Components/Lists/Items/Forum/ForumCategoryListItemBase';
import {ForumMentionsCategoryListItem} from '#src/Components/Lists/Items/Forum/ForumMentionsCategoryListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {ForumCategoriesScreenActionsMenu} from '#src/Components/Menus/Forum/ForumCategoriesScreenActionsMenu';
import {ForumCategoriesScreenSearchMenu} from '#src/Components/Menus/Forum/ForumCategoriesScreenSearchMenu';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {NotLoggedInView} from '#src/Components/Views/Static/NotLoggedInView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {useForumCategoriesQuery} from '#src/Queries/Forum/ForumCategoryQueries';
import {useUserKeywordQuery} from '#src/Queries/User/UserQueries';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/PreRegistrationScreen';

type Props = StackScreenProps<ForumStackParamList, ForumStackComponents.forumCategoriesScreen>;

export const ForumCategoriesScreen = (props: Props) => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.forums} urlPath={'/forums'}>
        <ForumCategoriesScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const ForumCategoriesScreenInner = ({navigation}: Props) => {
  const {data, refetch, isLoading} = useForumCategoriesQuery();
  const [refreshing, setRefreshing] = useState(false);
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const {isLoggedIn} = useAuth();
  const isFocused = useIsFocused();
  const {clearPrivileges} = usePrivilege();
  const {data: keywordData, refetch: refetchKeywordData} = useUserKeywordQuery({
    keywordType: 'alertwords',
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchUserNotificationData(), refetchKeywordData()]);
    setRefreshing(false);
  }, [refetch, refetchKeywordData, refetchUserNotificationData]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <ForumCategoriesScreenSearchMenu />
          <ForumCategoriesScreenActionsMenu />
        </MaterialHeaderButtons>
      </View>
    );
  }, []);

  useEffect(() => {
    // This clears the previous state of forum posts, specific forum, and the category list data.
    if (isFocused) {
      clearPrivileges();
    }
  }, [clearPrivileges, isFocused]);

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
            {keywordData && keywordData.keywords.length > 0 ? (
              keywordData.keywords.map(alertWord => {
                return (
                  <React.Fragment key={alertWord}>
                    <ForumAlertwordListItem alertword={alertWord} />
                    <Divider bold={true} />
                  </React.Fragment>
                );
              })
            ) : (
              <ForumCategoryListItemBase
                title={'No Keywords Configured'}
                description={'You can configure alert and mute keywords using the menu in the upper right.'}
              />
            )}
          </ListSection>
        </View>
      </ScrollingContentView>
    </AppView>
  );
};
