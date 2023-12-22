import React, {useEffect, useState} from 'react';
import {useDailyThemeQuery} from '../Queries/Alert/DailyThemeQueries';
import {useCruise} from '../Context/Contexts/CruiseContext';
import {DailyThemeData} from '../../libraries/Structs/ControllerStructs';
import {PaddedContentView} from './Content/PaddedContentView';
import {DailyThemeCard} from '../Cards/MainScreen/DailyThemeCard';

export const MainThemeView = () => {
  const {data: dailyThemeData} = useDailyThemeQuery();
  const {cruiseDayIndex} = useCruise();
  const [dailyTheme, setDailyTheme] = useState<DailyThemeData>();

  useEffect(() => {
    if (dailyThemeData) {
      let noMatch = true;
      dailyThemeData.every(dt => {
        if (dt.cruiseDay === cruiseDayIndex) {
          setDailyTheme(dt);
          noMatch = false;
          return false;
        }
        return true;
      });
      if (noMatch) {
        setDailyTheme(undefined);
      }
    }
  }, [cruiseDayIndex, dailyThemeData]);

  if (!dailyTheme) {
    return <></>;
  }
  return (
    <PaddedContentView>
      <DailyThemeCard dailyTheme={dailyTheme} />
    </PaddedContentView>
  );
};
