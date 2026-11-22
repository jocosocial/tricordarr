import {Formik, FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {TimeSettingsForm} from '#src/Components/Forms/Settings/TimeSettingsForm';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useDismissTimezoneWarning} from '#src/Hooks/useDismissTimezoneWarning';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {TimeSettingsFormValues} from '#src/Types/FormValues';

/**
 * Registered both under SettingsStackNavigator (Account > Settings > Time) and directly
 * under CommonScreens (pushed in-place from wherever a time zone warning is shown), so this
 * intentionally avoids a navigation prop typed to either specific stack's param list.
 */
export const TimeSettingsScreen = () => {
  const navigation = useCommonStack();
  const {appConfig, updateAppConfig} = useConfig();
  const {commonStyles} = useStyles();
  const [forceShowTimezoneWarning, setForceShowTimezoneWarning] = useState(appConfig.forceShowTimezoneWarning);
  const [silenceTimezoneWarnings, setSilenceTimezoneWarnings] = useState(appConfig.silenceTimezoneWarnings);
  // Only show the snooze while it is still in the future.
  const snoozeUntil =
    appConfig.timezoneWarningSnoozeUntil && appConfig.timezoneWarningSnoozeUntil > Date.now()
      ? new Date(appConfig.timezoneWarningSnoozeUntil)
      : undefined;
  const {cruiseDayToday, adjustedCruiseDayToday, cruiseDayIndex, adjustedCruiseDayIndex} = useCruise();

  const onSubmit = (values: TimeSettingsFormValues, helpers: FormikHelpers<TimeSettingsFormValues>) => {
    updateAppConfig({
      ...appConfig,
      manualTimeOffset: Number(values.manualTimeOffset),
    });
    helpers.setSubmitting(false);
  };

  const promptDismissTimezoneWarning = useDismissTimezoneWarning({
    onToday: () => setForceShowTimezoneWarning(false),
    onPermanent: () => {
      setSilenceTimezoneWarnings(true);
      setForceShowTimezoneWarning(false);
    },
  });

  /**
   * Turning silence on asks whether to hide the warnings for today or permanently; turning it off
   * re-enables them immediately and clears any snooze.
   */
  const toggleSilenceTimezoneWarnings = () => {
    if (!silenceTimezoneWarnings) {
      promptDismissTimezoneWarning();
      return;
    }
    updateAppConfig({
      ...appConfig,
      silenceTimezoneWarnings: false,
      timezoneWarningSnoozeUntil: undefined,
    });
    setSilenceTimezoneWarnings(false);
  };

  const toggleForceShowTimezoneWarning = () => {
    const newValue = !forceShowTimezoneWarning;
    updateAppConfig({
      ...appConfig,
      forceShowTimezoneWarning: newValue,
      timezoneWarningSnoozeUntil: newValue ? undefined : appConfig.timezoneWarningSnoozeUntil,
      silenceTimezoneWarnings: newValue ? false : appConfig.silenceTimezoneWarnings,
    });
    setForceShowTimezoneWarning(newValue);
    if (newValue) {
      setSilenceTimezoneWarnings(false);
    }
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => {
              navigation.push(CommonStackComponents.timeZoneHelpScreen);
            }}
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

  const initialValues: TimeSettingsFormValues = {manualTimeOffset: appConfig.manualTimeOffset.toString()};
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSection>
          <ListSubheader>Offset</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <TimeSettingsForm onSubmit={onSubmit} initialValues={initialValues} />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Warnings</ListSubheader>
        </ListSection>
        <Formik initialValues={{}} onSubmit={() => {}}>
          <View>
            <BooleanField
              name={'silenceTimezoneWarnings'}
              testID={'silenceTimezoneWarnings-switch'}
              label={'Silence Timezone Warnings'}
              onPress={toggleSilenceTimezoneWarnings}
              value={silenceTimezoneWarnings}
              helperText={'Hide timezone warnings throughout the app.'}
              style={commonStyles.paddingHorizontalSmall}
            />
            {snoozeUntil && (
              <PaddedContentView padTop={true}>
                <Text>
                  Dismissed for today. Warnings resume <RelativeTimeTag date={snoozeUntil} />.
                </Text>
              </PaddedContentView>
            )}
          </View>
        </Formik>
        {appConfig.enableDeveloperOptions && (
          <>
            <ListSubheader>Date Internals</ListSubheader>
            <DataFieldListItem title={'Cruise Day Today'} description={cruiseDayToday.toString()} />
            <DataFieldListItem title={'Adjusted Cruise Day Today'} description={adjustedCruiseDayToday.toString()} />
            <DataFieldListItem title={'Cruise Day Index'} description={cruiseDayIndex.toString()} />
            <DataFieldListItem title={'Adjusted Cruise Day Index'} description={adjustedCruiseDayIndex.toString()} />
            <ListSection>
              <ListSubheader>Developer Options</ListSubheader>
            </ListSection>
            <Formik initialValues={{}} onSubmit={() => {}}>
              <View>
                <BooleanField
                  name={'forceShowTimezoneWarning'}
                  testID={'forceShowTimezoneWarning-switch'}
                  label={'Force Show Timezone Warning'}
                  onPress={toggleForceShowTimezoneWarning}
                  value={forceShowTimezoneWarning}
                  helperText={
                    'Always show the timezone warning throughout schedule, event, LFG, and private event screens.'
                  }
                  disabled={appConfig.silenceTimezoneWarnings}
                  style={commonStyles.paddingHorizontalSmall}
                />
              </View>
            </Formik>
          </>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
