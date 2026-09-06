import React from 'react';
import {SegmentedButtons} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';
import {SegmentedButtonType} from '#src/Types';

interface ModeratorContentSegmentedButtonsProps {
  onEdit?: () => void;
  onDelete: () => void;
  testIDPrefix: string;
  isDeleting?: boolean;
  disabled?: boolean;
}

/**
 * Edit / Delete control on a content moderate screen.
 * Omit `onEdit` when the content type cannot be edited; Edit stays visible but disabled.
 */
export const ModeratorContentSegmentedButtons = ({
  onEdit,
  onDelete,
  testIDPrefix,
  isDeleting,
  disabled,
}: ModeratorContentSegmentedButtonsProps) => {
  const buttons: SegmentedButtonType[] = [
    {
      value: 'edit',
      label: 'Edit',
      icon: AppIcons.edit,
      disabled: disabled || !onEdit,
      testID: `${testIDPrefix}Edit-button`,
    },
    {
      value: 'delete',
      label: 'Delete',
      icon: AppIcons.delete,
      disabled: disabled || isDeleting,
      testID: `${testIDPrefix}Delete-button`,
    },
  ];

  const onValueChange = (value: string) => {
    if (value === 'edit') {
      onEdit?.();
      return;
    }
    if (value === 'delete') {
      onDelete();
    }
  };

  return <SegmentedButtons value={''} onValueChange={onValueChange} buttons={buttons} />;
};
