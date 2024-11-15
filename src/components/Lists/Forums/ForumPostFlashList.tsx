import {ForumData, ForumListData, PostData} from '../../../libraries/Structs/ControllerStructs.tsx';
import React, {useCallback, useState} from 'react';
import {FlatList, RefreshControlProps, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {useUserData} from '../../Context/Contexts/UserDataContext.ts';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {FlashList} from '@shopify/flash-list';
import {LabelDivider} from '../Dividers/LabelDivider.tsx';
import {ForumPostListItem} from '../Items/Forum/ForumPostListItem.tsx';

interface ForumPostFlashListProps {
  postList: PostData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  itemSeparator?: 'time';
  invertList?: boolean;
  forumData?: ForumData;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  maintainViewPosition?: boolean;
  enableShowInThread?: boolean;
  flatListRef: React.RefObject<FlatList<PostData>>;
  getListHeader?: () => React.JSX.Element;
  forumListData?: ForumListData;
}

// @TODO the API returns the first page of posts that you have not read.
// This means you should start at the beginning and scroll down.
// I think what I'm missing is that I never solved for starting at the beginning or end
// based on whether it was considered "unread" or not.
export const ForumPostFlashList = (props: ForumPostFlashListProps) => {
  const {commonStyles} = useStyles();
  const [showButton, setShowButton] = useState(false);
  const {profilePublicData} = useUserData();
  const {hasModerator} = usePrivilege();

  const styles = StyleSheet.create({
    postContainerView: {
      // ...(props.invertList ? commonStyles.verticallyInverted : undefined),
    },
    timeDividerStyle: {
      // ...(props.invertList ? commonStyles.verticallyInverted : undefined),
    },
    flatList: {
      ...commonStyles.paddingHorizontal,
      // ...(props.invertList ? commonStyles.verticallyInverted : undefined),
    },
  });

  const showNewDivider = useCallback(
    (index: number) => {
      if (props.forumListData) {
        if (props.forumListData.postCount === props.forumListData.readCount) {
          return false;
        }
        // index is inverted so the last message in the list is 0.
        // Add one to the readCount so that we render below the message at the readCount.
        // This doesn't do anything with un-inverted lists.
        return props.forumListData.postCount - index === props.forumListData.readCount + 1;
      }
    },
    [props.forumListData],
  );

  const renderItem = useCallback(
    ({item, index}: {item: PostData; index: number}) => {
      const enablePinnedPosts = hasModerator || props.forumData?.creator.userID === profilePublicData?.header.userID;
      return (
        <View style={styles.postContainerView}>
          {showNewDivider(index) && <LabelDivider label={'New'} />}
          <ForumPostListItem
            postData={item}
            enableShowInThread={props.enableShowInThread}
            enablePinnedPosts={enablePinnedPosts}
            forumData={props.forumData}
          />
        </View>
      );
    },
    [
      hasModerator,
      profilePublicData?.header.userID,
      styles.postContainerView,
      showNewDivider,
      props.enableShowInThread,
      props.forumData,
    ],
  );

  return (
    <>
      <FlashList
        renderItem={renderItem}
        data={props.postList}
        // https://github.com/Shopify/flash-list/issues/751
        overrideProps={{isInvertedVirtualizedList: props.invertList}}
        inverted={props.invertList}
        contentContainerStyle={styles.flatList}
      />
    </>
  );
};
