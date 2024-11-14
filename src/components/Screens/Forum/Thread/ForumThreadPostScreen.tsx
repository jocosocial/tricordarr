import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../../Navigation/CommonScreens';
import {ForumThreadScreenBase} from './ForumThreadScreenBase';
import {View} from 'react-native';
import {useStyles} from '../../../Context/Contexts/StyleContext';
import {Button, Text} from 'react-native-paper';
import {useForumThreadQuery} from '../../../Queries/Forum/ForumThreadQueries';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.forumThreadPostScreen>;

export const ForumThreadPostScreen = ({route, navigation}: Props) => {
  const {
    data,
    refetch,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    hasNextPage,
  } = useForumThreadQuery(undefined, route.params.postID);
  const {commonStyles} = useStyles();

  const getListHeader = () => {
    return (
      <View style={[commonStyles.flexRow]}>
        <View style={[commonStyles.alignItemsCenter, commonStyles.flex]}>
          <Text variant={'labelMedium'}>Showing forum starting at selected post.</Text>
          {data?.pages[0] && (
            <Button
              mode={'outlined'}
              style={[commonStyles.marginTopSmall]}
              onPress={() =>
                navigation.push(CommonStackComponents.forumThreadScreen, {forumID: data.pages[0].forumID})
              }>
              View Full Forum
            </Button>
          )}
        </View>
      </View>
    );
  };

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
      hasPreviousPage={undefined}
      getListHeader={route.params.postID ? getListHeader : undefined}
      invertList={false}
    />
  );
};
