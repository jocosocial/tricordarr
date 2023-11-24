import {Card, Text} from 'react-native-paper';
import React, {useEffect, useState} from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useDailyThemeQuery} from '../../Queries/Alert/DailyThemeQueries';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {DailyThemeData} from '../../../libraries/Structs/ControllerStructs';
import {AppImage} from '../../Images/AppImage';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {BottomTabComponents, MainStackComponents, RootStackComponents} from '../../../libraries/Enums/Navigation';

/**
 * A card to display the daily theme object as returned from the API. If no object then no theme.
 * The site UI invents some themes for days that don't have them.
 */
export const DailyThemeCard = () => {
  const {data: dailyThemeData, refetch} = useDailyThemeQuery();
  const {cruiseDayIndex} = useCruise();
  const [dailyTheme, setDailyTheme] = useState<DailyThemeData>();
  const {commonStyles} = useStyles();
  const rootNavigation = useRootStack();

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

  const onPress = () => {
    if (dailyTheme) {
      rootNavigation.navigate(RootStackComponents.rootContentScreen, {
        screen: BottomTabComponents.homeTab,
        params: {
          screen: MainStackComponents.dailyThemeScreen,
          params: {
            dailyTheme: dailyTheme,
          },
        },
      });
    }
  };

  if (!dailyTheme) {
    return <></>;
  }

  return (
    <Card style={[commonStyles.marginBottom, commonStyles.twitarrNeutral]} onPress={onPress}>
      <Card.Title
        title={"Today's Theme:"}
        subtitle={dailyTheme.title}
        titleStyle={[commonStyles.onTwitarrButton, commonStyles.bold]}
        subtitleVariant={'bodyLarge'}
        subtitleStyle={[commonStyles.onTwitarrButton]}
      />
      <Card.Content style={[commonStyles.marginBottomSmall]}>
        <Text numberOfLines={3} style={[commonStyles.onTwitarrButton]}>
          {dailyTheme.info}
        </Text>
      </Card.Content>
      {dailyTheme.image && (
        <AppImage fullPath={`/image/full/${dailyTheme.image}`} thumbPath={`/image/thumb/${dailyTheme.image}`} />
      )}
    </Card>
  );
};
