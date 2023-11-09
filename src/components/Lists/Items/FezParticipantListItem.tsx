import React from 'react';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useSeamailStack} from '../../Navigation/Stacks/SeamailStack';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {FezData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {FezType} from '../../../libraries/Enums/FezType';
import {UserListItem} from './UserListItem';

interface FezParticipantListItemProps {
  user: UserHeader;
  fez: FezData;
  onRemove?: () => void;
}

export const FezParticipantListItem = ({user, fez, onRemove}: FezParticipantListItemProps) => {
  const navigation = useSeamailStack();
  let enableDelete = true;
  const {profilePublicData} = useUserData();

  // Cannot delete participant if any condition is true:
  // * Fez is not "Open".
  // * Participant is yourself.
  // * Would leave less than 2 participants (the API currently allows this but I disagree with it).
  // * You are not the owner.
  if (
    fez.fezType !== FezType.open ||
    fez.owner.userID === user.userID ||
    (fez.members && fez.members.participants.length <= 2) ||
    profilePublicData?.header.userID !== fez.owner.userID
  ) {
    enableDelete = false;
  }

  const onPress = () => {
    navigation.push(SeamailStackScreenComponents.userProfileScreen, {
      userID: user.userID,
    });
  };

  return (
    <UserListItem
      userHeader={user}
      onPress={onPress}
      buttonIcon={AppIcons.delete}
      buttonOnPress={enableDelete ? onRemove : undefined}
    />
  );
};
