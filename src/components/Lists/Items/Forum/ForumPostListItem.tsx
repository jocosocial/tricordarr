import React from 'react';
import {ForumData, PostData} from '../../../../libraries/Structs/ControllerStructs';
import {MessageViewContainer} from '../../../Views/MessageViewContainer';
import {FlatListItemContent} from '../../../Views/Content/FlatListItemContent';
import {ContentPostImage} from '../../../Images/ContentPostImage';
import {ForumPostMessageView} from '../../../Views/Forum/ForumPostMessageView';
import {useForumStackNavigation} from '../../../Navigation/Stacks/ForumStackNavigator';
import {CommonStackComponents} from '../../../Navigation/CommonScreens';
import {ContentPostAvatar} from '../../../Views/Content/ContentPostAvatar.tsx';

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

export const ForumPostListItem = ({
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
      <ContentPostAvatar userHeader={postData.author} onPress={handleAuthorAvatarPress} />
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
