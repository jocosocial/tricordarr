import React from 'react';
import {PostData} from '../../../../libraries/Structs/ControllerStructs';
import {UserAvatarImage} from '../../../Images/UserAvatarImage';
import {MessageViewContainer} from '../../../Views/MessageViewContainer';
import {MessageAvatarContainerView} from '../../../Views/MessageAvatarContainerView';
import {FlatListItemContent} from '../../../Views/Content/FlatListItemContent';
import {BottomTabComponents, MainStackComponents, RootStackComponents} from '../../../../libraries/Enums/Navigation';
import {useRootStack} from '../../../Navigation/Stacks/RootStackNavigator';
import {ContentPostImage} from '../../../Images/ContentPostImage';
import {ForumPostMessageView} from '../../../Views/ForumPostMessageView';

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
}

export const ForumPostListItem = ({postData, enableShowInThread}: ForumPostListItemProps) => {
  const rootNavigation = useRootStack();

  const handleAuthorAvatarPress = () => {
    rootNavigation.push(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.homeTab,
      params: {
        screen: MainStackComponents.userProfileScreen,
        params: {
          userID: postData.author.userID,
        },
        initial: false,
      },
    });
  };

  return (
    <FlatListItemContent>
      <MessageAvatarContainerView onPress={handleAuthorAvatarPress}>
        <UserAvatarImage userHeader={postData.author} small={true} />
      </MessageAvatarContainerView>
      <MessageViewContainer>
        <ForumPostMessageView postData={postData} showAuthor={true} enableShowInThread={enableShowInThread} />
        {postData.images &&
          postData.images.map((image, index) => {
            return <ContentPostImage key={index} image={image} messageOnRight={false} />;
          })}
      </MessageViewContainer>
    </FlatListItemContent>
  );
};
