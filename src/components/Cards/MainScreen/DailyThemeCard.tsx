import {Card, Text} from 'react-native-paper';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {DailyThemeData} from '../../../libraries/Structs/ControllerStructs';
import {APIImage} from '../../Images/APIImage';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {BottomTabComponents, MainStackComponents, RootStackComponents} from '../../../libraries/Enums/Navigation';

/**
 * A card to display the daily theme object as returned from the API. If no object then no theme.
 * The site UI invents some themes for days that don't have them.
 */
export const DailyThemeCard = (props: {dailyTheme: DailyThemeData}) => {
  const {commonStyles} = useStyles();
  const rootNavigation = useRootStack();

  const onPress = () => {
    rootNavigation.navigate(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.homeTab,
      params: {
        screen: MainStackComponents.dailyThemeScreen,
        params: {
          dailyTheme: props.dailyTheme,
        },
      },
    });
  };

  return (
    <Card style={commonStyles.twitarrNeutral} onPress={onPress}>
      <Card.Title
        title={"Today's Theme:"}
        subtitle={props.dailyTheme.title}
        titleStyle={[commonStyles.onTwitarrButton, commonStyles.bold]}
        subtitleVariant={'bodyLarge'}
        subtitleStyle={[commonStyles.onTwitarrButton]}
      />
      <Card.Content style={[commonStyles.marginBottomSmall]}>
        <Text numberOfLines={3} style={[commonStyles.onTwitarrButton]}>
          {props.dailyTheme.info}
        </Text>
      </Card.Content>
      {props.dailyTheme.image && (
        <APIImage
          fullPath={`/image/full/${props.dailyTheme.image}`}
          thumbPath={`/image/thumb/${props.dailyTheme.image}`}
        />
      )}
    </Card>
  );
};
