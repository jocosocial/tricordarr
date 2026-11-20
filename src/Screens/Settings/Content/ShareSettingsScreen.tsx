import {Formik} from 'formik';
import React from 'react';
import {View} from 'react-native';

import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';

/**
 * Content settings for how the Share action behaves.
 */
export const ShareSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {commonStyles} = useStyles();
  const [shareOpensSheet, setShareOpensSheet] = React.useState(appConfig.userPreferences.shareOpensSheet);

  /**
   * Persists shareOpensSheet and keeps local switch state in sync.
   */
  const handleShareOpensSheet = () => {
    const newShareOpensSheet = !shareOpensSheet;
    updateAppConfig({
      ...appConfig,
      userPreferences: {
        ...appConfig.userPreferences,
        shareOpensSheet: newShareOpensSheet,
      },
    });
    setShareOpensSheet(newShareOpensSheet);
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <BooleanField
                name={'shareOpensSheet'}
                testID={'shareOpensSheet-switch'}
                label={'Use Advanced Sharing by Default'}
                onPress={handleShareOpensSheet}
                style={commonStyles.paddingHorizontalSmall}
                helperText={
                  'Tapping any Share button opens the advanced share sheet instead of copying the link to the clipboard.'
                }
                value={shareOpensSheet}
              />
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
