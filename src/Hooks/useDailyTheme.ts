import pluralize from 'pluralize';
import {useEffect, useState} from 'react';

import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useDailyThemeQuery} from '#src/Queries/Alert/DailyThemeQueries';
import {DailyThemeData} from '#src/Structs/ControllerStructs';

const getThemeForDay = (
  cruiseDayIndex: number,
  cruiseLength: number,
  dailyThemeData?: DailyThemeData[],
): DailyThemeData | undefined => {
  if (dailyThemeData) {
    let todaysTheme: DailyThemeData | undefined;
    dailyThemeData.every(dt => {
      if (dt.cruiseDay === cruiseDayIndex) {
        todaysTheme = dt;
      }
      return true;
    });
    // Default Themes
    if (!todaysTheme) {
      if (cruiseDayIndex >= cruiseLength - 1) {
        todaysTheme = {
          themeID: 'default_theme_after',
          title: `${cruiseDayIndex - cruiseLength + 1} ${pluralize('day', cruiseDayIndex - cruiseLength + 1)} after boat`,
          info: "JoCo Cruise has ended. Hope you're enjoying being back in the real world.",
          cruiseDay: cruiseDayIndex,
        };
      } else if (cruiseDayIndex < 0) {
        todaysTheme = {
          themeID: 'default_theme_before',
          title: `${Math.abs(cruiseDayIndex)} ${pluralize('day', Math.abs(cruiseDayIndex))} before boat!`,
          info: 'Soon™',
          cruiseDay: cruiseDayIndex,
        };
      } else {
        todaysTheme = {
          themeID: 'default_theme_before',
          title: `Cruise Day ${cruiseDayIndex + 1}: No Theme Day`,
          info: 'A wise man once said, "A day without a theme is like a guitar ever-so-slightly out of tune. You can play it however you want, and it will be great, but someone out there will know that if only there was a theme, everything would be in tune."',
          cruiseDay: cruiseDayIndex,
        };
      }
    }
    return todaysTheme;
  }
};

/**
 * The cruise's "Theme of the Day" for the currently viewed cruise day. Unrelated to the app's
 * UI color theme (see ThemeProvider/ThemeContext) -- this is cruise content, not app styling.
 */
export const useDailyTheme = (): DailyThemeData | undefined => {
  const {data: dailyThemeData} = useDailyThemeQuery();
  const {cruiseLength, adjustedCruiseDayIndex} = useCruise();
  const [dailyTheme, setDailyTheme] = useState<DailyThemeData>();

  useEffect(() => {
    setDailyTheme(getThemeForDay(adjustedCruiseDayIndex, cruiseLength, dailyThemeData));
  }, [adjustedCruiseDayIndex, cruiseLength, dailyThemeData]);

  return dailyTheme;
};
