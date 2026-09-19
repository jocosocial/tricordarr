import React from 'react';

import {DailyThemeCard} from '#src/Components/Cards/MainScreen/DailyThemeCard';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useDailyTheme} from '#src/Hooks/useDailyTheme';

const TodayThemeViewInner = () => {
  const dailyTheme = useDailyTheme();

  if (!dailyTheme) {
    return <></>;
  }
  return (
    <PaddedContentView>
      <DailyThemeCard dailyTheme={dailyTheme} />
    </PaddedContentView>
  );
};

export const TodayThemeView = () => {
  const {preRegistrationMode} = usePreRegistration();

  if (preRegistrationMode) {
    return <></>;
  }

  return <TodayThemeViewInner />;
};
