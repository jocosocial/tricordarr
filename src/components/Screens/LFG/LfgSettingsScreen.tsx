import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import React, {useState} from 'react';
import {Formik} from 'formik';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {View} from 'react-native';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {BooleanField} from '../../Forms/Fields/BooleanField';
import {HelperText, SegmentedButtons, Text} from 'react-native-paper';
import {SegmentedButtonType} from '../../../libraries/Types';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {ListSubheader} from '../../Lists/ListSubheader.tsx';
import {ListSection} from '../../Lists/ListSection.tsx';
import {PushNotificationConfig} from '../../../libraries/AppConfig.ts';
import {contentNotificationCategories} from '../../../libraries/Notifications/Content.ts';
import {LfgStackComponents} from '../../Navigation/Stacks/LFGStackNavigator.tsx';

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
              </ListSection>
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
