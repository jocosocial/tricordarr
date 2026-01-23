import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useForumThreadQuery} from '#src/Queries/Forum/ForumThreadQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ForumThreadScreenBase} from '#src/Screens/Forum/Thread/ForumThreadScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.forumThreadScreen>;

export const ForumThreadScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.forumThreadHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.forums} urlPath={`/forum/${props.route.params.forumID}`}>
        <ForumThreadScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const ForumThreadScreenInner = ({route}: Props) => {
  const {
    data,
    refetch,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useForumThreadQuery(route.params.forumID);

  return (
    <ForumThreadScreenBase
      data={data}
      refetch={refetch}
      isLoading={isLoading}
      fetchNextPage={fetchNextPage}
      fetchPreviousPage={fetchPreviousPage}
      isFetchingNextPage={isFetchingNextPage}
      isFetchingPreviousPage={isFetchingPreviousPage}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      invertList={route.params.forumListData?.postCount === route.params.forumListData?.readCount}
      forumListData={route.params.forumListData}
    />
  );
};
