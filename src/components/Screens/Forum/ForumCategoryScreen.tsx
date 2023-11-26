import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {useForumCategoryQuery} from '../../Queries/Forum/ForumCategoryQueries';
import {RefreshControl, View} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView';
import {Divider} from 'react-native-paper';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {ForumThreadListItem} from '../../Lists/Items/ForumThreadListItem';
import {ListSection} from '../../Lists/ListSection';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumCategoryScreen,
  NavigatorIDs.forumStack
>;

export const ForumCategoryScreen = ({route}: Props) => {
  const {data, refetch, isLoading} = useForumCategoryQuery(route.params.categoryId);
  const [refreshing, setRefreshing] = useState(false);
  const {forumThreads, setForumThreads} = useTwitarr();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  useEffect(() => {
    if (data && data.forumThreads) {
      setForumThreads(data.forumThreads);
    }
  }, [data, setForumThreads]);

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />}>
        <View>
          <ListSection>
            {forumThreads.map((thread, index) => {
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
    </AppView>
  );
};
