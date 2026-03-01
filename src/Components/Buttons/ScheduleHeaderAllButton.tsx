import React from 'react';

import {ScheduleHeaderButton} from '#src/Components/Buttons/ScheduleHeaderButton';

interface ScheduleHeaderAllButtonProps {
  isSelected?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export const ScheduleHeaderAllButton = (props: ScheduleHeaderAllButtonProps) => {
  return (
    <ScheduleHeaderButton
      isSelected={props.isSelected}
      onPress={props.onPress}
      disabled={props.disabled}
      primaryText={'All'}
      secondaryText={'Days'}
    />
  );
};
