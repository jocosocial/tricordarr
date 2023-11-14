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

export const LfgSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const [hidePastLfgs, setHidePastLfgs] = useState(appConfig.hidePastLfgs);
  const {setLfgHidePastFilter} = useScheduleFilter();
  const {commonStyles} = useStyles();

  const handleHidePastLfgs = () => {
    updateAppConfig({
      ...appConfig,
      hidePastLfgs: !appConfig.hidePastLfgs,
    });
    setHidePastLfgs(!appConfig.hidePastLfgs);
    setLfgHidePastFilter(!appConfig.hidePastLfgs);
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <SettingsBooleanListItem
                label={'Hide Past LFGs by Default'}
                helperText={
                  'Default to not showing LFGs that have already happened. You can still use the filters to view them.'
                }
                onPress={handleHidePastLfgs}
                value={hidePastLfgs}
                style={commonStyles.paddingHorizontal}
              />
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
