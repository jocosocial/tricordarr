import React from 'react';
import {TimezoneWarningCard} from '#src/Components/Cards/MainScreen/TimezoneWarningCard.tsx';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView.tsx';
import {useCruise} from '#src/Components/Context/Contexts/CruiseContext.ts';

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
