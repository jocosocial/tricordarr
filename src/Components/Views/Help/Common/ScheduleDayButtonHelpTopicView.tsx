import React from 'react';

import {ScheduleHeaderDayButton} from '#src/Components/Buttons/ScheduleHeaderDayButton';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const ScheduleDayButtonHelpTopicView = () => {
  return (
    <HelpTopicView
      title={'Now™'}
      right={
        <ScheduleHeaderDayButton
          cruiseDay={{
            date: new Date(),
            cruiseDay: 0,
          }}
          onPress={() => {}}
          disabled={true}
        />
      }>
      Pressing on a day button will take you to the schedule for that day. Pressing it again will jump you to around the
      current time.
    </HelpTopicView>
  );
};
