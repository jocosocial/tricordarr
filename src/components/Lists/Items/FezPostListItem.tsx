import React, {memo} from 'react';
import {FezData, FezPostData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {UserAvatarImage} from '#src/Components/Images/UserAvatarImage.tsx';
import {MessageView} from '#src/Components/Views/MessageView.tsx';
import {MessageViewContainer} from '#src/Components/Views/MessageViewContainer.tsx';
import {MessageSpacerView} from '#src/Components/Views/MessageSpacerView.tsx';
import {MessageAvatarContainerView} from '#src/Components/Views/MessageAvatarContainerView.tsx';
import {FlatListItemContent} from '#src/Components/Views/Content/FlatListItemContent.tsx';
import {usePrivilege} from '#src/Components/Context/Contexts/PrivilegeContext.ts';
import {ContentPostImage} from '#src/Components/Images/ContentPostImage.tsx';
import {useChatStack} from '#src/Components/Navigation/Stacks/ChatStackNavigator.tsx';
import {CommonStackComponents} from '#src/Components/Navigation/CommonScreens.tsx';
import {useUserProfileQuery} from '#src/Components/Queries/User/UserQueries.ts';

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
