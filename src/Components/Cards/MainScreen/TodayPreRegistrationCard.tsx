import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';

import {PreRegistrationListItem} from '#src/Components/Lists/Items/PreRegistrationListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/MainStackNavigator';
import {BottomTabComponents, useBottomTabNavigator} from '#src/Navigation/Tabs/BottomTabNavigator';

export const TodayPreRegistrationCard = () => {
  const {commonStyles} = useStyles();
  const mainNavigation = useMainStack();
  const bottomTabNavigation = useBottomTabNavigator();

  const styles = StyleSheet.create({
    card: {
      ...commonStyles.twitarrNeutral,
    },
    title: {
      ...commonStyles.onTwitarrButton,
      ...commonStyles.bold,
    },
    content: {
      ...commonStyles.marginBottomSmall,
    },
    text: {
      ...commonStyles.onTwitarrButton,
    },
  });

  return (
    <Card style={styles.card}>
      <Card.Title title={'Pre-Registration Setup'} titleStyle={styles.title} />
      <Card.Content style={styles.content}>
        <Text style={styles.text}>
          Twitarr's social media features aren't enabled right now (see the JoCo Discord instead). Here are some
          suggested actions that you can do to get you started:
        </Text>
        <ListSection>
          <PreRegistrationListItem
            title={'Setup Your Profile'}
            iconName={AppIcons.profile}
            onPress={() => mainNavigation.push(CommonStackComponents.userSelfProfileScreen)}
          />
          <PreRegistrationListItem
            title={'View the Schedule'}
            iconName={AppIcons.events}
            onPress={() =>
              bottomTabNavigation.navigate(BottomTabComponents.scheduleTab, {
                screen: CommonStackComponents.scheduleDayScreen,
                params: {noDrawer: true},
              })
            }
          />
          <PreRegistrationListItem
            title={'Read Performer Bios'}
            iconName={AppIcons.performer}
            onPress={() => mainNavigation.push(MainStackComponents.performerListScreen, {})}
          />
          <PreRegistrationListItem
            title={'Favorite Users'}
            iconName={AppIcons.userFavorite}
            onPress={() => mainNavigation.push(CommonStackComponents.usersList, {mode: 'favorite'})}
          />

          <PreRegistrationListItem
            title={'Help Manual'}
            iconName={AppIcons.help}
            onPress={() => mainNavigation.push(CommonStackComponents.helpIndexScreen)}
          />
        </ListSection>
      </Card.Content>
    </Card>
  );
};
