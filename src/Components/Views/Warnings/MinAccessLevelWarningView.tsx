import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';

import {BaseWarningView} from '#src/Components/Views/Warnings/BaseWarningView';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {alertDismissMinAccessWarning} from '#src/Libraries/Alerts/SettingsAlerts';

/**
 * Banner shown app-wide when the server currently requires a minimum access level to log in.
 * Mirrors the Site UI's maintenance-mode warning (trunk.html / TrunkContext.minAccessLevel).
 * Dismissal is persisted in AppConfig; re-enable it from Settings > Developer > Cruise Settings.
 */
export const MinAccessLevelWarningView = () => {
  const {isAccessRestricted, minAccessLevel} = useClientSettings();
  const {appConfig, updateAppConfig} = useConfig();
  const {theme} = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.colors.warningBannerBackground,
        },
        text: {
          color: theme.colors.onWarningBannerBackground,
        },
      }),
    [theme.colors.warningBannerBackground, theme.colors.onWarningBannerBackground],
  );

  if (!isAccessRestricted || appConfig.dismissMinAccessWarning) {
    return null;
  }

  return (
    <BaseWarningView
      variant={'neutral'}
      title={'Maintenance Mode'}
      message={`Only ${UserAccessLevel.getLabel(minAccessLevel)} users and above may log in.`}
      messageVariant={'labelMedium'}
      containerStyle={styles.container}
      titleStyle={styles.text}
      messageStyle={styles.text}
      onDismiss={() =>
        alertDismissMinAccessWarning(() => updateAppConfig({...appConfig, dismissMinAccessWarning: true}))
      }
      dismissIconColor={theme.colors.onWarningBannerBackground}
    />
  );
};
