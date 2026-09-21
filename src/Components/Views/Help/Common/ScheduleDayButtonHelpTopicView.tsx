import React, {useCallback} from 'react';
import {useSharedValue} from 'react-native-reanimated';

import {ScheduleHeaderDayButton} from '#src/Components/Buttons/ScheduleHeaderDayButton';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const ScheduleDayButtonHelpTopicView = () => {
  // Illustrative only - the button is disabled, and day 0 keeps it in its unselected colours.
  const liveSelectedDay = useSharedValue(-1);
  const onSelect = useCallback(() => {}, []);

  return (
    <HelpTopicView
      title={'Now™'}
      right={
        <ScheduleHeaderDayButton
          cruiseDay={{
            date: new Date(),
            cruiseDay: 0,
          }}
          liveSelectedDay={liveSelectedDay}
          onSelect={onSelect}
          disabled={true}
        />
      }>
      Pressing on a day button will take you to the schedule for that day. Pressing it again will jump you to around the
      current time.
    </HelpTopicView>
  );
};
