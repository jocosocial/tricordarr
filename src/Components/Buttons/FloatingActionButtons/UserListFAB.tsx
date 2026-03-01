import React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {UserRelationMode} from '#src/Queries/Users/UserRelationConstants';

interface UserListFABProps {
  mode: UserRelationMode;
  onPress: () => void;
  showLabel?: boolean;
}

const LABELS: Record<UserRelationMode, string> = {
  favorite: 'Add Favorite',
  block: 'Add Block',
  mute: 'Add Mute',
};

export const UserListFAB = ({mode, onPress, showLabel = true}: UserListFABProps) => {
  return <BaseFAB onPress={onPress} label={LABELS[mode]} showLabel={showLabel} />;
};
