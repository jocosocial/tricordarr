import React, {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {Card, IconButton, Text} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {alertSilenceTimezoneWarnings} from '#src/Libraries/Alerts/SettingsAlerts';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

export const TimezoneWarningCard = () => {
  const {commonStyles} = useStyles();
  const navigation = useCommonStack();
  const {appConfig, updateAppConfig} = useConfig();

  const onPress = () => navigation.push(CommonStackComponents.mainTimeZoneScreen);

  const handleDismiss = useCallback(
    () =>
      alertSilenceTimezoneWarnings(() =>
        updateAppConfig({...appConfig, silenceTimezoneWarnings: true, forceShowTimezoneWarning: false}),
      ),
    [appConfig, updateAppConfig],
  );

  const styles = StyleSheet.create({
    titleContainer: {
      minHeight: 0,
    },
  });

  const getRight = useCallback(
    () => (
      <IconButton
        icon={AppIcons.dismissCard}
        iconColor={commonStyles.onTwitarrButton.color}
        onPress={handleDismiss}
        testID={'timezoneWarningCardDismiss'}
      />
    ),
    [commonStyles.onTwitarrButton.color, handleDismiss],
  );

  return (
    <Card style={commonStyles.twitarrNegative} onPress={onPress}>
      <Card.Title
        title={'Time Zone Warning'}
        titleStyle={[commonStyles.onTwitarrButton, commonStyles.bold]}
        subtitleVariant={'bodyLarge'}
        subtitleStyle={[commonStyles.onTwitarrButton]}
        style={styles.titleContainer}
        right={getRight}
      />
      <Card.Content>
        <Text style={[commonStyles.onTwitarrButton]}>
          Your device and the server appear to be in different time zones. Tap this card to view more information.
          Remember that the ship clocks are right and Twitarr can be wrong. Tap the{' '}
          <AppIcon icon={AppIcons.dismissCard} small={true} color={commonStyles.onTwitarrButton.color} /> in the upper
          right to permanently dismiss this card.
        </Text>
      </Card.Content>
    </Card>
  );
};
