import {AppView} from '../../../Views/AppView';
import {FlatList, RefreshControl, View} from 'react-native';
import {ForumPostFlatList} from '../../../Lists/Forums/ForumPostFlatList';
import React, {useRef} from 'react';
import {useStyles} from '../../../Context/Contexts/StyleContext';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PostData} from '../../../../libraries/Structs/ControllerStructs';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {TimeDivider} from '../../../Lists/Dividers/TimeDivider';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {CommonStackComponents, CommonStackParamList} from '../../../Navigation/CommonScreens';
import {useForumThreadPinnedPostsQuery, useForumThreadQuery} from '../../../Queries/Forum/ForumThreadQueries.ts';
import {AppIcons} from '../../../../libraries/Enums/Icons.ts';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.forumPostPinnedScreen>;

export const ForumPostPinnedScreen = ({route}: Props) => {
  const {data, refetch, isFetching} = useForumThreadPinnedPostsQuery(route.params.forumID);
  const {data: forumData} = useForumThreadQuery(route.params.forumID);
  const {commonStyles} = useStyles();
  const flatListRef = useRef<FlatList<PostData>>(null);

  if (data === undefined) {
    return <LoadingView />;
  }

  if (data.length === 0) {
    return (
      <AppView>
        <ScrollingContentView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
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
        <ForumPostFlatList
          flatListRef={flatListRef}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          postList={data}
          enableShowInThread={true}
          forumData={forumData?.pages[0]}
          getListHeader={getListHeader}
        />
      </View>
    </AppView>
  );
};
