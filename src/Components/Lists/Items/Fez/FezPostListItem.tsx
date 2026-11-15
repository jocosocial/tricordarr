import React, {memo} from 'react';

import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {ContentPostImages} from '#src/Components/Images/ContentPostImages';
import {FezPostActionsMenu} from '#src/Components/Menus/Fez/FezPostActionsMenu';
import {FlatListItemContent} from '#src/Components/Views/Content/FlatListItemContent';
import {MessageAvatarContainerView} from '#src/Components/Views/MessageAvatarContainerView';
import {MessageSpacerView} from '#src/Components/Views/MessageSpacerView';
import {MessageView} from '#src/Components/Views/MessageView';
import {MessageViewContainer} from '#src/Components/Views/MessageViewContainer';
import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useChatStack} from '#src/Navigation/Stacks/Chat/ChatStackComponents';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {FezData, FezPostData} from '#src/Structs/ControllerStructs';

// https://github.com/akveo/react-native-ui-kitten/issues/1167
interface FezPostListItemProps {
  fez?: FezData;
  fezPost: FezPostData;
  index?: number;
  fullWidth?: boolean;
}

/**
 * Renders a fez post as a chat-style message row. `fez` is optional so the same
 * item can preview a post on a moderate screen that only has FezPostData.
 * `fullWidth` matches ForumPostListItem: avatar on the left, no side spacer, bubble stretched.
 */
const FezPostListItemInternal = ({fezPost, fez, fullWidth}: FezPostListItemProps) => {
  const {currentUserID} = useSession();
  const {asPrivilegedUser} = useElevation();
  const seamailNavigation = useChatStack();

  let showAuthor = fez ? fez.participantCount > 2 : true;

  // Do not show the author for the users own messages.
  if (fezPost.author.userID === currentUserID) {
    showAuthor = false;
  }

  // Always show the author of all messages in privileged conversations.
  if (asPrivilegedUser) {
    showAuthor = true;
  }

  if (fullWidth) {
    showAuthor = true;
  }

  const messageOnRight = fullWidth
    ? false
    : fezPost.author.userID === currentUserID || fezPost.author.username === asPrivilegedUser;

  const onPress = () => {
    seamailNavigation.push(CommonStackComponents.userProfileScreen, {
      userID: fezPost.author.userID,
    });
  };

  return (
    <FlatListItemContent>
      {!messageOnRight && (
        <MessageAvatarContainerView onPress={onPress}>
          <AvatarImage userHeader={fezPost.author} small={true} />
        </MessageAvatarContainerView>
      )}
      {messageOnRight && <MessageSpacerView />}
      <MessageViewContainer>
        <MessageView
          author={fezPost.author}
          text={fezPost.text}
          timestamp={new Date(fezPost.timestamp)}
          messageOnRight={messageOnRight}
          showAuthor={showAuthor}
          fullWidth={fullWidth}
          renderActionsMenu={({visible, closeMenu, anchor}) => (
            <FezPostActionsMenu visible={visible} closeMenu={closeMenu} anchor={anchor} fezPost={fezPost} fez={fez} />
          )}
        />
        <ContentPostImages images={fezPost.image ? [fezPost.image] : []} messageOnRight={messageOnRight} />
      </MessageViewContainer>
      {!messageOnRight && !fullWidth && <MessageSpacerView />}
    </FlatListItemContent>
  );
};

export const FezPostListItem = memo(FezPostListItemInternal);
