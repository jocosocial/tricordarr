import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useForumThreadQuery} from '#src/Queries/Forum/ForumThreadQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ForumThreadScreenBase} from '#src/Screens/Forum/Thread/ForumThreadScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.forumThreadPostScreen>;

/**
 * Site UI fallback uses /forum/{forumID}?startPost= when we have the forum UUID.
 * /forum/containingpost/{postID} 404s for deleted posts the same way the API
 * /forum/post/{id}/forum does.
 */
const getSiteUiPath = (forumID: string | undefined, postID: string) => {
  if (forumID) {
    return `/forum/${forumID}?startPost=${postID}`;
  }
  return `/forum/containingpost/${postID}`;
};

export const ForumThreadPostScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.forumThreadHelpScreen}>
      <DisabledFeatureScreen
        feature={SwiftarrFeature.forums}
        urlPath={getSiteUiPath(props.route.params.forumID, props.route.params.postID)}>
        <ForumThreadPostScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const ForumThreadPostScreenInner = ({route, navigation}: Props) => {
  // Forward forumID so the query uses /forum/{forumID}?startPost= instead of
  // /forum/post/{id}/forum, which 404s when the post is soft-deleted.
  const {
    data,
    refetch,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    hasNextPage,
  } = useForumThreadQuery(route.params.forumID, route.params.postID);
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
                navigation.push(CommonStackComponents.forumThreadScreen, {
                  forumID: data.pages[0].forumID,
                  asPrivilegedUser: route.params.asPrivilegedUser,
                })
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
      initialElevation={route.params.asPrivilegedUser}
      startFromPost={true}
    />
  );
};
