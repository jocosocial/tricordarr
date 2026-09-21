import React from 'react';
import type {SharedValue} from 'react-native-reanimated';

import {ScheduleHeaderButton} from '#src/Components/Buttons/ScheduleHeaderButton';

interface ScheduleHeaderAllButtonProps {
  liveSelectedDay: SharedValue<number>;
  /** Stable across renders so this component's React.memo actually holds. */
  onSelect: (cruiseDay: number) => void;
  disabled?: boolean;
}

const ScheduleHeaderAllButtonComponent = (props: ScheduleHeaderAllButtonProps) => {
  return (
    <ScheduleHeaderButton
      liveSelectedDay={props.liveSelectedDay}
      // "All Days" is cruise day 0, which a pager drag never reaches - it only ever lights up
      // when the committed selection is 0, on the screens that enable it.
      cruiseDay={0}
      onSelect={props.onSelect}
      disabled={props.disabled}
      primaryText={'All'}
      secondaryText={'Days'}
      testID={'scheduleHeaderAll-button'}
    />
  );
};

export const ScheduleHeaderAllButton = React.memo(ScheduleHeaderAllButtonComponent);
