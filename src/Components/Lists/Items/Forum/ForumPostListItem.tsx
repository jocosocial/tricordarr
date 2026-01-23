import React, {memo} from 'react';

import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {ContentPostImage} from '#src/Components/Images/ContentPostImage';
import {FlatListItemContent} from '#src/Components/Views/Content/FlatListItemContent';
import {ForumPostMessageView} from '#src/Components/Views/Forum/ForumPostMessageView';
import {MessageAvatarContainerView} from '#src/Components/Views/MessageAvatarContainerView';
import {MessageViewContainer} from '#src/Components/Views/MessageViewContainer';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useForumStackNavigation} from '#src/Navigation/Stacks/ForumStackNavigator';
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

  const handleAuthorAvatarPress = () => {
    forumNavigation.push(CommonStackComponents.userProfileScreen, {
      userID: postData.author.userID,
    });
  };

  return (
    <FlatListItemContent>
      <MessageAvatarContainerView onPress={handleAuthorAvatarPress}>
        <AvatarImage userHeader={postData.author} small={true} />
      </MessageAvatarContainerView>
      <MessageViewContainer>
        <ForumPostMessageView
          postData={postData}
          showAuthor={true}
          enableShowInThread={enableShowInThread}
          enablePinnedPosts={enablePinnedPosts}
          forumData={forumData}
        />
        {postData.images &&
          postData.images.map((image, index) => {
            return <ContentPostImage key={index} image={image} messageOnRight={false} />;
          })}
      </MessageViewContainer>
    </FlatListItemContent>
  );
};

// https://react.dev/reference/react/memo
export const ForumPostListItem = memo(ForumPostListItemInternal);
