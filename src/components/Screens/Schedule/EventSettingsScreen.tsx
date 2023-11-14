import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import React, {useState} from 'react';
import {Formik} from 'formik';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {SettingsBooleanListItem} from '../../Lists/Items/SettingsBooleanListItem';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {View} from 'react-native';
import {useScheduleFilter} from '../../Context/Contexts/ScheduleFilterContext';

export const EventSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const [unified, setUnified] = useState(appConfig.unifiedSchedule);
  const [hidePastLfgs, setHidePastLfgs] = useState(appConfig.hidePastLfgs);
  const [enableLateDayFlip, setEnableLateDayFlip] = useState(appConfig.enableLateDayFlip);
  const {setLfgHidePastFilter} = useScheduleFilter();
  const {commonStyles} = useStyles();

  const handleShowLfgs = () => {
    updateAppConfig({
      ...appConfig,
      unifiedSchedule: !appConfig.unifiedSchedule,
    });
    setUnified(!appConfig.unifiedSchedule);
  };

  const handleHidePastLfgs = () => {
    updateAppConfig({
      ...appConfig,
      hidePastLfgs: !appConfig.hidePastLfgs,
    });
    setHidePastLfgs(!appConfig.hidePastLfgs);
    setLfgHidePastFilter(!appConfig.hidePastLfgs);
  };

  const handleEnableLateDayFlip = () => {
    updateAppConfig({
      ...appConfig,
      enableLateDayFlip: !appConfig.enableLateDayFlip,
    });
    setEnableLateDayFlip(!appConfig.enableLateDayFlip);
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <SettingsBooleanListItem
                label={'Show LFGs in Schedule'}
                helperText={
                  'Display community-created Looking For Group objects in the main schedule along with Official and Shadow Cruise events.'
                }
                onPress={handleShowLfgs}
                value={unified}
                style={commonStyles.paddingHorizontal}
              />
              <SettingsBooleanListItem
                label={'Hide Past LFGs by Default'}
                helperText={
                  'Default to not showing LFGs that have already happened. You can still use the filters to view them. Past LFGs will always show in the main schedule view if Show LFGs in Schedule above is enabled.'
                }
                onPress={handleHidePastLfgs}
                value={hidePastLfgs}
                style={commonStyles.paddingHorizontal}
              />
              <SettingsBooleanListItem
                label={'Enable Late-Night Day Flip'}
                helperText={
                  'Show the next days schedule after 3:00AM rather than after Midnight. For example: With this setting enabled (default), opening the schedule at 2:00AM on Thursday will show you Wednesdays schedule by default. If this setting is disabled, at 2:00AM on Thursday you would see Thursdays schedule by default.'
                }
                onPress={handleEnableLateDayFlip}
                value={enableLateDayFlip}
                style={commonStyles.paddingHorizontal}
              />
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
