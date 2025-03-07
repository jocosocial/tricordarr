import React, {memo} from 'react';
import {FezData, FezPostData} from '../../../libraries/Structs/ControllerStructs';
import {UserAvatarImage} from '../../Images/UserAvatarImage';
import {MessageView} from '../../Views/MessageView';
import {MessageViewContainer} from '../../Views/MessageViewContainer';
import {MessageSpacerView} from '../../Views/MessageSpacerView';
import {MessageAvatarContainerView} from '../../Views/MessageAvatarContainerView';
import {FlatListItemContent} from '../../Views/Content/FlatListItemContent';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {ContentPostImage} from '../../Images/ContentPostImage';
import {useChatStack} from '../../Navigation/Stacks/ChatStackNavigator.tsx';
import {CommonStackComponents} from '../../Navigation/CommonScreens';
import {useUserProfileQuery} from '../../Queries/User/UserQueries.ts';

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
