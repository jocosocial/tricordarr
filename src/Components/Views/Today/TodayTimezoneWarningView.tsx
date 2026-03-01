import React from 'react';

import {TimezoneWarningCard} from '#src/Components/Cards/MainScreen/TimezoneWarningCard';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useTime} from '#src/Context/Contexts/TimeContext';

export const TodayTimezoneWarningView = () => {
  const {showTimeZoneWarning} = useTime();

  if (!showTimeZoneWarning) {
    return null;
  }

  return (
    <PaddedContentView>
      <TimezoneWarningCard />
    </PaddedContentView>
  );
};
