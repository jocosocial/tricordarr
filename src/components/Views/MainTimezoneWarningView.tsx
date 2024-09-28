import React from 'react';
import {TimezoneWarningCard} from '../Cards/MainScreen/TimezoneWarningCard.tsx';
import {PaddedContentView} from './Content/PaddedContentView.tsx';
import {useCruise} from '../Context/Contexts/CruiseContext.ts';

export const MainTimezoneWarningView = () => {
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
