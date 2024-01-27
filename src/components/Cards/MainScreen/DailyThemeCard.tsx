import {Card, Text} from 'react-native-paper';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {DailyThemeData} from '../../../libraries/Structs/ControllerStructs';
import {APIImage} from '../../Images/APIImage';
import {MainStackComponents} from '../../../libraries/Enums/Navigation';
import {useMainStack} from '../../Navigation/Stacks/MainStackNavigator';

interface DailyThemeCardProps {
  dailyTheme: DailyThemeData;
  cardTitle?: string;
}

/**
 * A card to display the daily theme object as returned from the API. If no object then no theme.
 * The site UI invents some themes for days that don't have them.
 */
export const DailyThemeCard = (props: DailyThemeCardProps) => {
  const {commonStyles} = useStyles();
  const mainNavigation = useMainStack();

  const onPress = () => {
    mainNavigation.push(MainStackComponents.dailyThemeScreen, {
      dailyTheme: props.dailyTheme,
    });
  };

  return (
    <Card style={commonStyles.twitarrNeutral} onPress={onPress}>
      <Card.Title
        title={props.cardTitle || "Today's Theme:"}
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
