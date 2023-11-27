import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {useForumCategoryQuery} from '../../Queries/Forum/ForumCategoryQueries';
import {RefreshControl, View} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView';
import {Divider, Text} from 'react-native-paper';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {ForumThreadListItem} from '../../Lists/Items/Forum/ForumThreadListItem';
import {ListSection} from '../../Lists/ListSection';
import {ForumThreadFAB} from '../../Buttons/FloatingActionButtons/ForumThreadFAB';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {ForumListDataActions} from '../../Reducers/Forum/ForumListDataReducer';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumCategoryScreen,
  NavigatorIDs.forumStack
>;

export const ForumCategoryScreen = ({route, navigation}: Props) => {
  const {data, refetch, isLoading} = useForumCategoryQuery(route.params.categoryId);
  const [refreshing, setRefreshing] = useState(false);
  const {forumListData, dispatchForumListData} = useTwitarr();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  const onCreatePress = () => {
    console.log('Creating in', data?.categoryID);
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item title={'Sort'} iconName={AppIcons.sort} onPress={() => console.log('sort')} />
          <Item title={'Filter'} iconName={AppIcons.filter} onPress={() => console.log('filter')} />
          <Item title={'Help'} iconName={AppIcons.help} onPress={() => console.log('help')} />
        </HeaderButtons>
      </View>
    );
  }, []);

  useEffect(() => {
    if (data && data.forumThreads) {
      dispatchForumListData({
        type: ForumListDataActions.setList,
        threadList: data.forumThreads,
      });
    }
  }, [data, dispatchForumListData, route.params.categoryId]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />}>
        <View>
          {forumListData.length === 0 && (
            <PaddedContentView padTop={true}>
              <Text>There aren't any forums in this category yet.</Text>
            </PaddedContentView>
          )}
          <ListSection>
            {forumListData.map((thread, index) => {
              return (
                <React.Fragment key={thread.forumID}>
                  {index === 0 && <Divider bold={true} />}
                  <ForumThreadListItem forumData={thread} />
                  <Divider bold={true} />
                </React.Fragment>
              );
            })}
          </ListSection>
        </View>
      </ScrollingContentView>
      <ForumThreadFAB onPress={onCreatePress} />
    </AppView>
  );
};
