import React from 'react';
import {FezData, FezPostData} from '../../../libraries/Structs/ControllerStructs';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {UserAvatarImage} from '../../Images/UserAvatarImage';
import {MessageView} from '../../Views/MessageView';
import {MessageViewContainer} from '../../Views/MessageViewContainer';
import {MessageSpacerView} from '../../Views/MessageSpacerView';
import {MessageAvatarContainerView} from '../../Views/MessageAvatarContainerView';
import {FlatListItemContent} from '../../Views/Content/FlatListItemContent';
import {BottomTabComponents, MainStackComponents, RootStackComponents} from '../../../libraries/Enums/Navigation';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {AppImage} from '../../Images/AppImage';
import {View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ContentPostImage} from '../../Images/ContentPostImage';

// https://github.com/akveo/react-native-ui-kitten/issues/1167
interface FezPostListItemProps {
  fez: FezData;
  fezPost: FezPostData;
  index: number;
  separators: {
    highlight: () => void;
    unhighlight: () => void;
    updateProps: (select: 'leading' | 'trailing', newProps: any) => void;
  };
}

export const FezPostListItem = ({fezPost, index, separators, fez}: FezPostListItemProps) => {
  const {profilePublicData} = useUserData();
  const {asPrivilegedUser} = usePrivilege();
  const rootNavigation = useRootStack();
  const {commonStyles} = useStyles();

  let showAuthor = fez.participantCount > 2;

  // Do not show the author for the users own messages.
  if (fezPost.author.userID === profilePublicData?.header.userID) {
    showAuthor = false;
  }

  // Always show the author of all messages in privileged conversations.
  if (asPrivilegedUser) {
    showAuthor = true;
  }

  const messageOnRight =
    fezPost.author.userID === profilePublicData?.header.userID || fezPost.author.username === asPrivilegedUser;

  const onPress = () => {
    rootNavigation.navigate(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.homeTab,
      params: {
        screen: MainStackComponents.userProfileScreen,
        params: {
          userID: fezPost.author.userID,
        },
      },
    });
  };

  return (
    <FlatListItemContent>
      {!messageOnRight && (
        <MessageAvatarContainerView onPress={onPress}>
          <UserAvatarImage userID={fezPost.author.userID} small={true} />
        </MessageAvatarContainerView>
      )}
      {messageOnRight && <MessageSpacerView />}
      <MessageViewContainer>
        <MessageView fezPost={fezPost} messageOnRight={messageOnRight} showAuthor={showAuthor} />
        {fezPost.image && <ContentPostImage image={fezPost.image} messageOnRight={messageOnRight} />}
      </MessageViewContainer>
      {!messageOnRight && <MessageSpacerView />}
    </FlatListItemContent>
  );
};
