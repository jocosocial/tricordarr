import {Card, Text} from 'react-native-paper';
import {AndroidColor} from '@notifee/react-native';
import React, {useEffect, useState} from 'react';
import {useAppTheme} from '../../../styles/Theme';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useDailyThemeQuery} from '../../Queries/Alert/DailyThemeQueries';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {DailyThemeData} from '../../../libraries/Structs/ControllerStructs';

export const DailyThemeCard = () => {
  const theme = useAppTheme();
  const {commonStyles} = useStyles();
  const {data: dailyThemeData, refetchDailyThemes} = useDailyThemeQuery();
  const {cruiseDayIndex} = useCruise();
  const [dailyTheme, setDailyTheme] = useState<DailyThemeData>();

  console.log(dailyThemeData);

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
    <Card style={{backgroundColor: theme.colors.twitarrNeutralButton}}>
      <Card.Title title={"Today's theme is:"} subtitle={'New Cruisers'} titleStyle={{color: AndroidColor.WHITE}} subtitleVariant={'bodyLarge'} subtitleStyle={{color: AndroidColor.WHITE}} />
      <Card.Content>
        <Text style={{color: AndroidColor.WHITE}}>JoCo Cruise has ended. Hope you're enjoying being back in the real world.</Text>
      </Card.Content>
    </Card>
  );
};
