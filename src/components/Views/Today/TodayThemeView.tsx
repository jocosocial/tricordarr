import React, {useEffect, useState} from 'react';
import {useDailyThemeQuery} from '#src/Components/Queries/Alert/DailyThemeQueries.ts';
import {useCruise} from '#src/Components/Context/Contexts/CruiseContext.ts';
import {DailyThemeData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView.tsx';
import {DailyThemeCard} from '#src/Components/Cards/MainScreen/DailyThemeCard.tsx';

export const TodayThemeView = () => {
  const {data: dailyThemeData} = useDailyThemeQuery();
  const {cruiseLength, adjustedCruiseDayIndex} = useCruise();
  const [dailyTheme, setDailyTheme] = useState<DailyThemeData>();

  useEffect(() => {
    setDailyTheme(DailyThemeData.getThemeForDay(adjustedCruiseDayIndex, cruiseLength, dailyThemeData));
  }, [adjustedCruiseDayIndex, cruiseLength, dailyThemeData]);

  if (!dailyTheme) {
    return <></>;
  }
  return (
    <PaddedContentView>
      <DailyThemeCard dailyTheme={dailyTheme} />
    </PaddedContentView>
  );
};
