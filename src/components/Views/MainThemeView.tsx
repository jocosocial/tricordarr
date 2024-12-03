import React, {useEffect, useState} from 'react';
import {useDailyThemeQuery} from '../Queries/Alert/DailyThemeQueries.ts';
import {useCruise} from '../Context/Contexts/CruiseContext';
import {DailyThemeData} from '../../libraries/Structs/ControllerStructs';
import {PaddedContentView} from './Content/PaddedContentView';
import {DailyThemeCard} from '../Cards/MainScreen/DailyThemeCard';

export const MainThemeView = () => {
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
