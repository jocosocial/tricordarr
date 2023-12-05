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

export const LfgSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const [hidePastLfgs, setHidePastLfgs] = useState(appConfig.hidePastLfgs);
  const {setLfgHidePastFilter} = useFilter();
  const {commonStyles} = useStyles();

  const handleHidePastLfgs = () => {
    const newValue = !appConfig.hidePastLfgs;
    console.log('Setting to', newValue);
    updateAppConfig({
      ...appConfig,
      hidePastLfgs: newValue,
    });
    setHidePastLfgs(newValue);
    setLfgHidePastFilter(newValue);
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
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
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
