import React from 'react';

import {TimezoneWarningCard} from '#src/Components/Cards/MainScreen/TimezoneWarningCard';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useCruise} from '#src/Context/Contexts/CruiseContext';

export const TodayTimezoneWarningView = () => {
  const {showTimeZoneWarning} = useCruise();
  if (!showTimeZoneWarning) {
    return <></>;
  }

  return (
    <PaddedContentView>
      <TimezoneWarningCard />
    </PaddedContentView>
  );
};
