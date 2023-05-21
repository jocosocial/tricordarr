import React from 'react';
import {FezData, FezPostData} from '../../../libraries/Structs/ControllerStructs';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {UserAvatarImage} from '../../Images/UserAvatarImage';
import {MessageView} from '../../Views/MessageView';
import {MessageViewContainer} from '../../Views/MessageViewContainer';
import {MessageSpacerView} from '../../Views/MessageSpacerView';
import {MessageAvatarContainerView} from '../../Views/MessageAvatarContainerView';
import {FlatListItemContent} from '../../Views/Content/FlatListItemContent';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useSeamailStack} from '../../Navigation/Stacks/SeamailStack';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';

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
  const navigation = useSeamailStack();
  const {asPrivilegedUser} = usePrivilege();

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
    navigation.push(SeamailStackScreenComponents.userProfileScreen, {
      userID: fezPost.author.userID,
      username: fezPost.author.username,
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
      </MessageViewContainer>
      {!messageOnRight && <MessageSpacerView />}
    </FlatListItemContent>
  );
};
