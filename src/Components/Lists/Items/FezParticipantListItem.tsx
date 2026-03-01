import React from 'react';

import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AppIcons} from '#src/Enums/Icons';
import {FezData, UserHeader} from '#src/Structs/ControllerStructs';

interface FezParticipantListItemProps {
  user: UserHeader;
  fez: FezData;
  onRemove?: () => void;
  onPress?: () => void;
}

export const FezParticipantListItem = ({user, fez, onRemove, onPress}: FezParticipantListItemProps) => {
  let enableDelete = true;
  const {currentUserID} = useSession();

  // Cannot delete participant if:
  // * They (or you) are the owner.
  // * You aren't the owner.
  // But can if you are you.
  if (user.userID === fez.owner.userID) {
    enableDelete = false;
  } else if (user.userID === currentUserID && user.userID === fez.owner.userID) {
    enableDelete = false;
  } else if (currentUserID !== fez.owner.userID && currentUserID !== user.userID) {
    enableDelete = false;
  }

  return (
    <UserListItem
      userHeader={user}
      onPress={onPress}
      buttonIcon={AppIcons.delete}
      buttonOnPress={enableDelete ? onRemove : undefined}
    />
  );
};
