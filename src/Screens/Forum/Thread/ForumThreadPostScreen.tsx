import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useForumThreadQuery} from '#src/Queries/Forum/ForumThreadQueries';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {ForumThreadScreenBase} from '#src/Screens/Forum/Thread/ForumThreadScreenBase';
import {PreRegistrationScreen} from '#src/Screens/PreRegistrationScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.forumThreadPostScreen>;

export const ForumThreadPostScreen = (props: Props) => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen
        feature={SwiftarrFeature.forums}
        urlPath={`/forum/containingpost/${props.route.params.postID}`}>
        <ForumThreadPostScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const ForumThreadPostScreenInner = ({route, navigation}: Props) => {
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

  const styles = StyleSheet.create({
    outerContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.marginVertical,
    },
    innerContainer: {
      ...commonStyles.alignItemsCenter,
      ...commonStyles.flex,
    },
    button: commonStyles.marginTopSmall,
  });

  const getListHeader = () => {
    return (
      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          <Text variant={'labelMedium'}>Showing forum starting at selected post.</Text>
          {data?.pages[0] && (
            <Button
              mode={'outlined'}
              style={styles.button}
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
      getListHeader={route.params.postID ? getListHeader : undefined}
    />
  );
};
