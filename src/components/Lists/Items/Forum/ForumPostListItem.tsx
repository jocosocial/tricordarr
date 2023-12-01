import React from 'react';
import {FezData, FezPostData, PostData} from '../../../../libraries/Structs/ControllerStructs';
import {useUserData} from '../../../Context/Contexts/UserDataContext';
import {UserAvatarImage} from '../../../Images/UserAvatarImage';
import {MessageView} from '../../../Views/MessageView';
import {MessageViewContainer} from '../../../Views/MessageViewContainer';
import {MessageSpacerView} from '../../../Views/MessageSpacerView';
import {MessageAvatarContainerView} from '../../../Views/MessageAvatarContainerView';
import {FlatListItemContent} from '../../../Views/Content/FlatListItemContent';
import {BottomTabComponents, MainStackComponents, RootStackComponents} from '../../../../libraries/Enums/Navigation';
import {usePrivilege} from '../../../Context/Contexts/PrivilegeContext';
import {useRootStack} from '../../../Navigation/Stacks/RootStackNavigator';
import {APIImage} from '../../../Images/APIImage';
import {View} from 'react-native';
import {useStyles} from '../../../Context/Contexts/StyleContext';
import {ContentPostImage} from '../../../Images/ContentPostImage';
import {Text} from 'react-native-paper';
import {ForumPostMessageView} from '../../../Views/ForumPostMessageView';
import {commonStyles} from '../../../../styles';

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

  const onPress = () => {
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
      <MessageAvatarContainerView onPress={onPress}>
        <UserAvatarImage userID={postData.author.userID} small={true} />
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
