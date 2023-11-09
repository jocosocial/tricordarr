import React from 'react';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {FezData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {UserListItem} from './UserListItem';

interface FezParticipantListItemProps {
  user: UserHeader;
  fez: FezData;
  onRemove?: () => void;
  onPress?: () => void;
}

export const FezParticipantListItem = ({user, fez, onRemove, onPress}: FezParticipantListItemProps) => {
  let enableDelete = true;
  const {profilePublicData} = useUserData();

  // Cannot delete participant if any condition is true:
  // * Participant is yourself.
  // * You are not the owner.
  if (fez.owner.userID === user.userID || profilePublicData?.header.userID !== fez.owner.userID) {
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
