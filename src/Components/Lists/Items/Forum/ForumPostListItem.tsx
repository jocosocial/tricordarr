import React, {memo} from 'react';

import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {ContentPostImages} from '#src/Components/Images/ContentPostImages';
import {ForumPostActionsMenu} from '#src/Components/Menus/Forum/ForumPostActionsMenu';
import {FlatListItemContent} from '#src/Components/Views/Content/FlatListItemContent';
import {MessageAvatarContainerView} from '#src/Components/Views/MessageAvatarContainerView';
import {MessageView} from '#src/Components/Views/MessageView';
import {MessageViewContainer} from '#src/Components/Views/MessageViewContainer';
import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useForumStackNavigation} from '#src/Navigation/Stacks/Forum/ForumStackComponents';
import {ForumData, PostData} from '#src/Structs/ControllerStructs';

// https://github.com/akveo/react-native-ui-kitten/issues/1167
interface ForumPostListItemProps {
  postData: PostData;
  index?: number;
  separators?: {
    highlight: () => void;
    unhighlight: () => void;
    updateProps: (select: 'leading' | 'trailing', newProps: any) => void;
  };
  enableShowInThread?: boolean;
  enablePinnedPosts?: boolean;
  forumData?: ForumData;
}

const ForumPostListItemInternal = ({
  postData,
  enableShowInThread,
  enablePinnedPosts,
  forumData,
}: ForumPostListItemProps) => {
  const forumNavigation = useForumStackNavigation();
  const commonNavigation = useCommonStack();
  const {asPrivilegedUser} = useElevation();

  const handleAuthorAvatarPress = () => {
    forumNavigation.push(CommonStackComponents.userProfileScreen, {
      userID: postData.author.userID,
    });
  };

  /**
   * Opens the post in its thread. Same destination as the Show in Thread menu item.
   */
  const handleShowInThread = () => {
    commonNavigation.push(CommonStackComponents.forumThreadPostScreen, {
      postID: postData.postID.toString(),
      asPrivilegedUser,
    });
  };

  /**
   * Navigates to the hashtag search screen for a tapped hashtag in the post body.
   */
  const handleHashtagPress = (tag: string) => {
    commonNavigation.push(CommonStackComponents.forumPostHashtagScreen, {
      hashtag: tag,
    });
  };

  /**
   * Navigates to the profile of a mentioned user.
   */
  const handleMentionPress = (username: string) => {
    const strippedName = username.replace('@', '');
    commonNavigation.push(CommonStackComponents.usernameProfileScreen, {
      username: strippedName,
    });
  };

  return (
    <FlatListItemContent>
      <MessageAvatarContainerView onPress={handleAuthorAvatarPress}>
        <AvatarImage userHeader={postData.author} small={true} />
      </MessageAvatarContainerView>
      <MessageViewContainer>
        <MessageView
          author={postData.author}
          text={postData.text}
          timestamp={new Date(postData.createdAt)}
          showAuthor={true}
          fullWidth={true}
          showByline={true}
          showFavoriteAuthor={true}
          isBookmarked={postData.isBookmarked}
          isPinned={postData.isPinned}
          onPress={enableShowInThread ? handleShowInThread : undefined}
          hashtagOnPress={handleHashtagPress}
          mentionOnPress={handleMentionPress}
          renderActionsMenu={({visible, closeMenu, anchor}) => (
            <ForumPostActionsMenu
              visible={visible}
              closeMenu={closeMenu}
              anchor={anchor}
              forumPost={postData}
              enableShowInThread={enableShowInThread}
              enablePinnedPosts={enablePinnedPosts}
              forumData={forumData}
            />
          )}
        />
        <ContentPostImages images={postData.images ?? []} />
      </MessageViewContainer>
    </FlatListItemContent>
  );
};

// https://react.dev/reference/react/memo
export const ForumPostListItem = memo(ForumPostListItemInternal);
