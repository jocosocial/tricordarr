import React, {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {Card, IconButton, Text} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {PreRegistrationListItem} from '#src/Components/Lists/Items/PreRegistrationListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useMainStack} from '#src/Navigation/Stacks/MainStackNavigator';

export const TodayWelcomeAboardCard = () => {
  const {commonStyles} = useStyles();
  const {appConfig, updateAppConfig} = useConfig();
  const mainNavigation = useMainStack();

  const handleDismiss = useCallback(() => {
    updateAppConfig({
      ...appConfig,
      dismissWelcomeAboard: true,
    });
  }, [appConfig, updateAppConfig]);

  const styles = StyleSheet.create({
    card: {
      ...commonStyles.twitarrPositive,
    },
    titleContainer: {
      minHeight: 0,
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

  const getRight = useCallback(
    () => (
      <IconButton icon={AppIcons.dismissCard} iconColor={commonStyles.onTwitarrButton.color} onPress={handleDismiss} />
    ),
    [commonStyles.onTwitarrButton.color, handleDismiss],
  );

  return (
    <Card style={styles.card}>
      <Card.Title title={'Welcome Aboard!'} titleStyle={styles.title} style={styles.titleContainer} right={getRight} />
      <Card.Content style={styles.content}>
        <Text style={styles.text}>
          All features are now enabled. If you're not sure where to start, check out the Help Manual below or in the
          drawer menu <AppIcon icon={AppIcons.drawer} small={true} color={commonStyles.onTwitarrButton.color} /> in the
          upper left.
        </Text>
        <ListSection>
          <PreRegistrationListItem
            title={'Help Manual'}
            iconName={AppIcons.help}
            onPress={() => mainNavigation.push(CommonStackComponents.helpIndexScreen)}
          />
        </ListSection>
        <Text style={styles.text}>
          If you haven't already and wish to create a user profile for youself, you can do that below or by tapping the
          avatar image in the upper right and selecting "Your Profile".
        </Text>
        <ListSection>
          <PreRegistrationListItem
            title={'Setup Your Profile'}
            iconName={AppIcons.profile}
            onPress={() => mainNavigation.push(CommonStackComponents.userSelfProfileScreen)}
          />
        </ListSection>
        <Text style={styles.text}>
          Have fun! Tap the{' '}
          <AppIcon icon={AppIcons.dismissCard} small={true} color={commonStyles.onTwitarrButton.color} /> in the upper
          right to permanently dismiss this card.
        </Text>
      </Card.Content>
    </Card>
  );
};
