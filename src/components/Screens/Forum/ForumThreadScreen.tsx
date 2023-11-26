import React, {useCallback, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useForumThreadQuery} from '../../Queries/Forum/ForumCategoryQueries';
import {RefreshControl, View} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView';
import {Divider, Text} from 'react-native-paper';
import {ListSection} from '../../Lists/ListSection';
import {ForumCategoryFAB} from '../../Buttons/FloatingActionButtons/ForumCategoryFAB';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumThreadScreen,
  NavigatorIDs.forumStack
>;

export const ForumThreadScreen = ({route}: Props) => {
  const {data, refetch, isLoading} = useForumThreadQuery(route.params.forumID);
  // const {forumCategories, setForumCategories} = useTwitarr();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  // useEffect(() => {
  //   if (data) {
  //     setForumCategories(data);
  //   }
  // }, [data, setForumCategories]);

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
            {data.posts.map((post, index) => {
              return (
                <React.Fragment key={post.postID}>
                  {index === 0 && <Divider bold={true} />}
                  <Text>{post.text}</Text>
                  <Divider bold={true} />
                </React.Fragment>
              );
            })}
          </ListSection>
        </View>
      </ScrollingContentView>
      <ForumCategoryFAB />
    </AppView>
  );
};
