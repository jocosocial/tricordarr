import React from 'react';
import {useForumThreadQuery} from '../../../Queries/Forum/ForumCategoryQueries';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../../Navigation/CommonScreens';
import {ForumThreadScreenBase} from './ForumThreadScreenBase';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.forumThreadScreen>;
export const ForumThreadScreen = ({route}: Props) => {
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
      invertList={true}
    />
  );
};
