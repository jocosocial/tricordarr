import React from 'react';

import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AppIcons} from '#src/Enums/Icons';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface FezParticipantListItemProps {
  user: UserHeader;
  owner: UserHeader;
  onRemove?: () => void;
  onPress?: () => void;
  onModerate?: () => void;
  /**
   * When true, skip the "current user must be owner or self" check so moderators
   * can remove members they do not own. The owner still cannot be removed.
   */
  allowRemove?: boolean;
}

/**
 * User row for fez/LFG/private-event participant lists. Shows a delete button when
 * the viewer may remove this person, and an optional moderate-user button.
 */
export const FezParticipantListItem = ({
  user,
  owner,
  onRemove,
  onPress,
  onModerate,
  allowRemove = false,
}: FezParticipantListItemProps) => {
  const {currentUserID} = useSession();
  let enableDelete = true;

  // Cannot delete participant if they are the owner. Otherwise: owner and self
  // can remove, unless `allowRemove` overrides the owner/self check (moderators).
  if (user.userID === owner.userID) {
    enableDelete = false;
  } else if (allowRemove) {
    enableDelete = true;
  } else if (currentUserID !== owner.userID && currentUserID !== user.userID) {
    enableDelete = false;
  }

  return (
    <UserListItem
      userHeader={user}
      onPress={onPress}
      buttonIcon={AppIcons.delete}
      buttonOnPress={enableDelete && onRemove ? () => onRemove() : undefined}
      secondaryButtonIcon={onModerate ? AppIcons.moderator : undefined}
      secondaryButtonOnPress={onModerate ? () => onModerate() : undefined}
    />
  );
};
