import React from 'react';
import {SegmentedButtons} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';
import {SegmentedButtonType} from '#src/Types';

interface ModeratorContentSegmentedButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  testIDPrefix: string;
  isDeleting?: boolean;
}

/**
 * Edit / Delete control on a content moderate screen.
 */
export const ModeratorContentSegmentedButtons = ({
  onEdit,
  onDelete,
  testIDPrefix,
  isDeleting,
}: ModeratorContentSegmentedButtonsProps) => {
  const buttons: SegmentedButtonType[] = [
    {
      value: 'edit',
      label: 'Edit',
      icon: AppIcons.edit,
      testID: `${testIDPrefix}Edit-button`,
    },
    {
      value: 'delete',
      label: 'Delete',
      icon: AppIcons.delete,
      disabled: isDeleting,
      testID: `${testIDPrefix}Delete-button`,
    },
  ];

  const onValueChange = (value: string) => {
    if (value === 'edit') {
      onEdit();
      return;
    }
    if (value === 'delete') {
      onDelete();
    }
  };

  return <SegmentedButtons value={''} onValueChange={onValueChange} buttons={buttons} />;
};
