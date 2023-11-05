import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import React, {useState} from 'react';
import {Formik} from 'formik';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {SettingsBooleanListItem} from '../../Lists/Items/SettingsBooleanListItem';
import {useStyles} from '../../Context/Contexts/StyleContext';

export const ScheduleSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const [unified, setUnified] = useState(appConfig.unifiedSchedule);
  const {commonStyles} = useStyles();

  const handleShowLfgs = () => {
    updateAppConfig({
      ...appConfig,
      unifiedSchedule: !appConfig.unifiedSchedule,
    });
    setUnified(!appConfig.unifiedSchedule);
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <SettingsBooleanListItem
              label={'Show LFGs in Schedule'}
              helperText={
                'Display community-created Looking For Group objects in the main schedule along with Official and Shadow Cruise events.'
              }
              onPress={handleShowLfgs}
              value={unified}
              style={commonStyles.paddingHorizontal}
            />
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
