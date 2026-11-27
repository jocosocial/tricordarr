import {StackScreenProps} from '@react-navigation/stack';
import {FlashListRef} from '@shopify/flash-list';
import React, {useRef} from 'react';
import {View} from 'react-native';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {TimeDivider} from '#src/Components/Lists/Dividers/TimeDivider';
import {ForumPostList} from '#src/Components/Lists/Forums/ForumPostList';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useForumThreadPinnedPostsQuery, useForumThreadQuery} from '#src/Queries/Forum/ForumThreadQueries';
import {PostData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.forumPostPinnedScreen>;

export const ForumPostPinnedScreen = ({route}: Props) => {
  const {data, refetch, isFetching} = useForumThreadPinnedPostsQuery(route.params.forumID);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch, isRefreshing: isFetching});
  const {data: forumData} = useForumThreadQuery(route.params.forumID);
  const {commonStyles} = useStyles();
  const flatListRef = useRef<FlashListRef<PostData>>(null);

  if (data === undefined) {
    return (
      <AppView>
        <LoadingView />
      </AppView>
    );
  }

  if (data.length === 0) {
    return (
      <AppView>
        <ScrollingContentView refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <PaddedContentView>
            <TimeDivider label={'No posts to display'} />
          </PaddedContentView>
        </ScrollingContentView>
      </AppView>
    );
  }

  const getListHeader = () => <PaddedContentView />;

  return (
    <AppView>
      <View style={[commonStyles.flex]}>
        <ForumPostList
          listRef={flatListRef}
          refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          postList={data}
          enableShowInThread={true}
          forumData={forumData?.pages[0]}
          getListHeader={getListHeader}
        />
      </View>
    </AppView>
  );
};
