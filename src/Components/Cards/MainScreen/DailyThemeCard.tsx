import React from 'react';
import {Card, Text} from 'react-native-paper';

import {APIImage} from '#src/Components/Images/APIImage';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/MainStackNavigator';
import {DailyThemeData} from '#src/Structs/ControllerStructs';

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
      {props.dailyTheme.image && <APIImage path={props.dailyTheme.image} mode={'cardcover'} />}
    </Card>
  );
};
