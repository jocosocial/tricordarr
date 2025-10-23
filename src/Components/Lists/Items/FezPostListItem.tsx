import React, {memo} from 'react';

import {ContentPostImage} from '#src/Components/Images/ContentPostImage';
import {UserAvatarImage} from '#src/Components/Images/UserAvatarImage';
import {FlatListItemContent} from '#src/Components/Views/Content/FlatListItemContent';
import {MessageAvatarContainerView} from '#src/Components/Views/MessageAvatarContainerView';
import {MessageSpacerView} from '#src/Components/Views/MessageSpacerView';
import {MessageView} from '#src/Components/Views/MessageView';
import {MessageViewContainer} from '#src/Components/Views/MessageViewContainer';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useChatStack} from '#src/Navigation/Stacks/ChatStackNavigator';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezData, FezPostData} from '#src/Structs/ControllerStructs';

// https://github.com/akveo/react-native-ui-kitten/issues/1167
interface FezPostListItemProps {
  fez: FezData;
  fezPost: FezPostData;
  index: number;
}

const FezPostListItemInternal = ({fezPost, fez}: FezPostListItemProps) => {
  const {data: profilePublicData} = useUserProfileQuery();
  const {asPrivilegedUser} = usePrivilege();
  const seamailNavigation = useChatStack();

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
    seamailNavigation.push(CommonStackComponents.userProfileScreen, {
      userID: fezPost.author.userID,
    });
  };

  return (
    <FlatListItemContent>
      {!messageOnRight && (
        <MessageAvatarContainerView onPress={onPress}>
          <UserAvatarImage userHeader={fezPost.author} small={true} />
        </MessageAvatarContainerView>
      )}
      {messageOnRight && <MessageSpacerView />}
      <MessageViewContainer>
        <MessageView fez={fez} fezPost={fezPost} messageOnRight={messageOnRight} showAuthor={showAuthor} />
        {fezPost.image && <ContentPostImage image={fezPost.image} messageOnRight={messageOnRight} />}
      </MessageViewContainer>
      {!messageOnRight && <MessageSpacerView />}
    </FlatListItemContent>
  );
};

export const FezPostListItem = memo(FezPostListItemInternal);
