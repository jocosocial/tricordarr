import {Formik} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useLfgFilter} from '#src/Context/Contexts/LfgFilterContext';
import {usePermissions} from '#src/Context/Contexts/PermissionsContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {PushNotificationConfig} from '#src/Libraries/AppConfig';
import {contentNotificationCategories} from '#src/Libraries/Notifications/Content';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useSettingsStack} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';

export const LfgSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {hasNotificationPermission} = usePermissions();
  const navigation = useSettingsStack();
  const [hidePastLfgs, setHidePastLfgs] = useState(appConfig.schedule.hidePastLfgs);
  const {setLfgHidePastFilter} = useLfgFilter();
  const {commonStyles} = useStyles();

  const handleHidePastLfgs = () => {
    const newValue = !appConfig.schedule.hidePastLfgs;
    updateAppConfig({
      ...appConfig,
      schedule: {
        ...appConfig.schedule,
        hidePastLfgs: newValue,
      },
    });
    setHidePastLfgs(newValue);
    setLfgHidePastFilter(newValue);
  };

  const toggleValue = (configKey: keyof PushNotificationConfig) => {
    let pushConfig = appConfig.pushNotifications;
    // https://bobbyhadz.com/blog/typescript-cannot-assign-to-because-it-is-read-only-property
    (pushConfig[configKey] as boolean) = !appConfig.pushNotifications[configKey];
    updateAppConfig({
      ...appConfig,
      pushNotifications: pushConfig,
    });
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.lfgHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <ListSection>
                <ListSubheader>General</ListSubheader>
                <BooleanField
                  name={'hidePastLfgs'}
                  testID={'hidePastLfgs-switch'}
                  label={'Hide Past LFGs by Default'}
                  onPress={handleHidePastLfgs}
                  style={commonStyles.paddingHorizontalSmall}
                  helperText={
                    'Default to not showing LFGs that have already happened. You can still use the filters to view them.'
                  }
                  value={hidePastLfgs}
                />
              </ListSection>
            </View>
          </Formik>
        </PaddedContentView>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <ListSection>
                <ListSubheader>Push Notifications</ListSubheader>
                <BooleanField
                  key={contentNotificationCategories.fezUnreadMsg.configKey}
                  name={contentNotificationCategories.fezUnreadMsg.configKey}
                  testID={`${contentNotificationCategories.fezUnreadMsg.configKey}-switch`}
                  label={contentNotificationCategories.fezUnreadMsg.title}
                  value={appConfig.pushNotifications.fezUnreadMsg}
                  onPress={() => toggleValue(contentNotificationCategories.fezUnreadMsg.configKey)}
                  disabled={!hasNotificationPermission}
                  helperText={contentNotificationCategories.fezUnreadMsg.description}
                  style={commonStyles.paddingHorizontalSmall}
                />
                <BooleanField
                  key={contentNotificationCategories.joinedLFGStarting.configKey}
                  name={contentNotificationCategories.joinedLFGStarting.configKey}
                  testID={`${contentNotificationCategories.joinedLFGStarting.configKey}-switch`}
                  label={contentNotificationCategories.joinedLFGStarting.title}
                  value={appConfig.pushNotifications.joinedLFGStarting}
                  onPress={() => toggleValue(contentNotificationCategories.joinedLFGStarting.configKey)}
                  disabled={!hasNotificationPermission}
                  helperText={contentNotificationCategories.joinedLFGStarting.description}
                  style={commonStyles.paddingHorizontalSmall}
                />
                <BooleanField
                  key={contentNotificationCategories.addedToLFG.configKey}
                  name={contentNotificationCategories.addedToLFG.configKey}
                  testID={`${contentNotificationCategories.addedToLFG.configKey}-switch`}
                  label={contentNotificationCategories.addedToLFG.title}
                  value={appConfig.pushNotifications.addedToLFG}
                  onPress={() => toggleValue(contentNotificationCategories.addedToLFG.configKey)}
                  disabled={!hasNotificationPermission}
                  helperText={contentNotificationCategories.addedToLFG.description}
                  style={commonStyles.paddingHorizontalSmall}
                />
                <BooleanField
                  key={contentNotificationCategories.lfgCanceled.configKey}
                  name={contentNotificationCategories.lfgCanceled.configKey}
                  testID={`${contentNotificationCategories.lfgCanceled.configKey}-switch`}
                  label={contentNotificationCategories.lfgCanceled.title}
                  value={appConfig.pushNotifications.lfgCanceled}
                  onPress={() => toggleValue(contentNotificationCategories.lfgCanceled.configKey)}
                  disabled={!hasNotificationPermission}
                  helperText={contentNotificationCategories.lfgCanceled.description}
                  style={commonStyles.paddingHorizontalSmall}
                />
              </ListSection>
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
