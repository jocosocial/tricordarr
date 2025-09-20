import React, {useEffect, useState} from 'react';
import {useDailyThemeQuery} from '#src/Queries/Alert/DailyThemeQueries';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {DailyThemeData} from '#src/Structs/ControllerStructs';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {DailyThemeCard} from '#src/Components/Cards/MainScreen/DailyThemeCard';

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
