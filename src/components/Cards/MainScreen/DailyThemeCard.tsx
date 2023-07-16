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
  const {data: dailyThemeData} = useDailyThemeQuery();
  const {cruiseDayIndex} = useCruise();
  const [dailyTheme, setDailyTheme] = useState<DailyThemeData>();
  const {commonStyles} = useStyles();

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
    <Card style={[commonStyles.marginBottomSmall, {backgroundColor: theme.colors.twitarrNeutralButton}]}>
      <Card.Title
        title={"Today's theme:"}
        subtitle={dailyTheme.title}
        titleStyle={{color: AndroidColor.WHITE}}
        subtitleVariant={'bodyLarge'}
        subtitleStyle={{color: AndroidColor.WHITE}}
      />
      <Card.Content>
        <Text style={{color: AndroidColor.WHITE}}>{dailyTheme.info}</Text>
      </Card.Content>
    </Card>
  );
};
