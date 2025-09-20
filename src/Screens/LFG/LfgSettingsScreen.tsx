import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import React, {useState} from 'react';
import {Formik} from 'formik';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {View} from 'react-native';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {HelperText, SegmentedButtons, Text} from 'react-native-paper';
import {SegmentedButtonType} from '#src/Types';
import {AppIcons} from '#src/Enums/Icons';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {ListSection} from '#src/Components/Lists/ListSection';
import {PushNotificationConfig} from '#src/Libraries/AppConfig';
import {contentNotificationCategories} from '#src/Libraries/Notifications/Content';
import {LfgStackComponents} from '#src/Navigation/Stacks/LFGStackNavigator';

export const LfgSettingsScreen = () => {
  const {appConfig, updateAppConfig, hasNotificationPermission} = useConfig();
  const [hidePastLfgs, setHidePastLfgs] = useState(appConfig.schedule.hidePastLfgs);
  const {setLfgHidePastFilter} = useFilter();
  const {commonStyles} = useStyles();
  const [defaultScreen, setDefaultScreen] = useState(appConfig.schedule.defaultLfgScreen);

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

  const lfgDefaultButtons: SegmentedButtonType[] = [
    {
      value: LfgStackComponents.lfgFindScreen,
      label: 'Find',
      icon: AppIcons.lfgFind,
    },
    {
      value: LfgStackComponents.lfgJoinedScreen,
      label: 'Joined',
      icon: AppIcons.lfgJoined,
    },
    {
      value: LfgStackComponents.lfgOwnedScreen,
      label: 'Owned',
      icon: AppIcons.lfgOwned,
    },
  ];

  const handleLfgDefaultScreen = (value: string) => {
    updateAppConfig({
      ...appConfig,
      schedule: {
        ...appConfig.schedule,
        defaultLfgScreen: value as LfgStackComponents,
      },
    });
    setDefaultScreen(value as LfgStackComponents);
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
                  label={'Hide Past LFGs by Default'}
                  onPress={handleHidePastLfgs}
                  style={commonStyles.paddingHorizontal}
                  helperText={
                    'Default to not showing LFGs that have already happened. You can still use the filters to view them.'
                  }
                  value={hidePastLfgs}
                />
              </ListSection>
            </View>
          </Formik>
        </PaddedContentView>
        <PaddedContentView>
          <Text style={commonStyles.marginBottomSmall}>Default LFG Screen</Text>
          <SegmentedButtons buttons={lfgDefaultButtons} value={defaultScreen} onValueChange={handleLfgDefaultScreen} />
          <HelperText style={commonStyles.onBackground} type={'info'}>
            Changing this setting requires an app restart.
          </HelperText>
        </PaddedContentView>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <ListSection>
                <ListSubheader>Push Notifications</ListSubheader>
                <BooleanField
                  key={contentNotificationCategories.fezUnreadMsg.configKey}
                  name={contentNotificationCategories.fezUnreadMsg.configKey}
                  label={contentNotificationCategories.fezUnreadMsg.title}
                  value={appConfig.pushNotifications.fezUnreadMsg}
                  onPress={() => toggleValue(contentNotificationCategories.fezUnreadMsg.configKey)}
                  disabled={!hasNotificationPermission}
                  helperText={contentNotificationCategories.fezUnreadMsg.description}
                  style={commonStyles.paddingHorizontal}
                />
                <BooleanField
                  key={contentNotificationCategories.joinedLFGStarting.configKey}
                  name={contentNotificationCategories.joinedLFGStarting.configKey}
                  label={contentNotificationCategories.joinedLFGStarting.title}
                  value={appConfig.pushNotifications.joinedLFGStarting}
                  onPress={() => toggleValue(contentNotificationCategories.joinedLFGStarting.configKey)}
                  disabled={!hasNotificationPermission}
                  helperText={contentNotificationCategories.joinedLFGStarting.description}
                  style={commonStyles.paddingHorizontal}
                />
                <BooleanField
                  key={contentNotificationCategories.addedToLFG.configKey}
                  name={contentNotificationCategories.addedToLFG.configKey}
                  label={contentNotificationCategories.addedToLFG.title}
                  value={appConfig.pushNotifications.addedToLFG}
                  onPress={() => toggleValue(contentNotificationCategories.addedToLFG.configKey)}
                  disabled={!hasNotificationPermission}
                  helperText={contentNotificationCategories.addedToLFG.description}
                  style={commonStyles.paddingHorizontal}
                />
                <BooleanField
                  key={contentNotificationCategories.lfgCanceled.configKey}
                  name={contentNotificationCategories.lfgCanceled.configKey}
                  label={contentNotificationCategories.lfgCanceled.title}
                  value={appConfig.pushNotifications.lfgCanceled}
                  onPress={() => toggleValue(contentNotificationCategories.lfgCanceled.configKey)}
                  disabled={!hasNotificationPermission}
                  helperText={contentNotificationCategories.lfgCanceled.description}
                  style={commonStyles.paddingHorizontal}
                />
              </ListSection>
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
