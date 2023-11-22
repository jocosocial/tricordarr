import {Card, Text} from 'react-native-paper';
import React, {useEffect, useState} from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useDailyThemeQuery} from '../../Queries/Alert/DailyThemeQueries';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {DailyThemeData} from '../../../libraries/Structs/ControllerStructs';
import {ThemeCardCoverImage} from '../../Images/ThemeCardCoverImage';

/**
 * A card to display the daily theme object as returned from the API. If no object then no theme.
 * The site UI invents some themes for days that don't have them.
 */
export const DailyThemeCard = () => {
  const {data: dailyThemeData, refetch} = useDailyThemeQuery();
  const {cruiseDayIndex} = useCruise();
  const [dailyTheme, setDailyTheme] = useState<DailyThemeData>();
  const {commonStyles} = useStyles();

  useEffect(() => {
    refetch();
  }, [cruiseDayIndex, refetch]);

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

  console.log(dailyTheme);

  return (
    <Card style={[commonStyles.marginBottomSmall, commonStyles.twitarrNeutral]}>
      <Card.Title
        title={"Today's Theme:"}
        subtitle={dailyTheme.title}
        titleStyle={[commonStyles.onTwitarrButton, commonStyles.bold]}
        subtitleVariant={'bodyLarge'}
        subtitleStyle={[commonStyles.onTwitarrButton]}
      />
      <Card.Content style={[commonStyles.marginBottomSmall]}>
        <Text style={[commonStyles.onTwitarrButton]}>{dailyTheme.info}</Text>
      </Card.Content>
      {dailyTheme.image && <ThemeCardCoverImage fileName={dailyTheme.image} />}
    </Card>
  );
};
