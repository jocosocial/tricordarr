import {Formik, FormikHelpers} from 'formik';
import React, {useState} from 'react';
import {View} from 'react-native';

import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {TimeSettingsForm} from '#src/Components/Forms/Settings/TimeSettingsForm';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {TimeSettingsFormValues} from '#src/Types/FormValues';

export const TimeSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {commonStyles} = useStyles();
  const [forceShowTimezoneWarning, setForceShowTimezoneWarning] = useState(appConfig.forceShowTimezoneWarning);

  const onSubmit = (values: TimeSettingsFormValues, helpers: FormikHelpers<TimeSettingsFormValues>) => {
    updateAppConfig({
      ...appConfig,
      manualTimeOffset: Number(values.manualTimeOffset),
    });
    helpers.setSubmitting(false);
  };

  const toggleForceShowTimezoneWarning = () => {
    const newValue = !forceShowTimezoneWarning;
    updateAppConfig({
      ...appConfig,
      forceShowTimezoneWarning: newValue,
    });
    setForceShowTimezoneWarning(newValue);
  };

  const initialValues: TimeSettingsFormValues = {manualTimeOffset: appConfig.manualTimeOffset.toString()};
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <TimeSettingsForm onSubmit={onSubmit} initialValues={initialValues} />
        </PaddedContentView>
        {appConfig.enableDeveloperOptions && (
          <>
            <ListSection>
              <ListSubheader>Developer Options</ListSubheader>
            </ListSection>
            <Formik initialValues={{}} onSubmit={() => {}}>
              <View>
                <BooleanField
                  name={'forceShowTimezoneWarning'}
                  label={'Force Show Timezone Warning'}
                  onPress={toggleForceShowTimezoneWarning}
                  value={forceShowTimezoneWarning}
                  helperText={'Always show the timezone warning on the Today screen.'}
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
