import {AppView} from '../../../Views/AppView';
import {FlatList, RefreshControl, View} from 'react-native';
import {ForumPostFlatList} from '../../../Lists/Forums/ForumPostFlatList';
import React, {useRef} from 'react';
import {useStyles} from '../../../Context/Contexts/StyleContext';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents, NavigatorIDs} from '../../../../libraries/Enums/Navigation';
import {PostData} from '../../../../libraries/Structs/ControllerStructs';
import {useForumThreadPinnedPostsQuery} from '../../../Queries/Forum/ForumCategoryQueries';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {TimeDivider} from '../../../Lists/Dividers/TimeDivider';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumPostPinnedScreen,
  NavigatorIDs.forumStack
>;

export const ForumPostPinnedScreen = ({route}: Props) => {
  const {data, refetch, isFetching} = useForumThreadPinnedPostsQuery(route.params.forumID);
  const {commonStyles} = useStyles();
  const flatListRef = useRef<FlatList<PostData>>(null);

  if (data === undefined) {
    return <LoadingView />;
  }

  if (data.length === 0) {
    return (
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <PaddedContentView>
          <TimeDivider label={'No posts to display'} />
        </PaddedContentView>
      </ScrollingContentView>
    );
  }

  return (
    <AppView>
      <View style={[commonStyles.flex, commonStyles.marginTopSmall]}>
        <ForumPostFlatList
          flatListRef={flatListRef}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          postList={data}
          invertList={false}
          enableShowInThread={true}
        />
      </View>
    </AppView>
  );
};
