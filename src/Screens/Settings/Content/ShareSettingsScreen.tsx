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
 * Content settings for how share actions encode a link (app deep link vs public web URL).
 */
export const ShareSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {commonStyles} = useStyles();
  const [shareWebURLs, setShareWebURLs] = React.useState(!appConfig.userPreferences.shareAppURI);

  /**
   * Persists shareAppURI as the inverse of this switch (on = web URLs) and
   * keeps local switch state in sync.
   */
  const handleShareWebURLs = () => {
    const newShareWebURLs = !shareWebURLs;
    updateAppConfig({
      ...appConfig,
      userPreferences: {
        ...appConfig.userPreferences,
        shareAppURI: !newShareWebURLs,
      },
    });
    setShareWebURLs(newShareWebURLs);
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <BooleanField
                name={'shareWebURLs'}
                testID={'shareWebURLs-switch'}
                label={'Share Web URLs by Default'}
                onPress={handleShareWebURLs}
                style={commonStyles.paddingHorizontalSmall}
                helperText={
                  'Share content using web URLs by default. When disabled (the default), sharing uses a custom URI link that opens this app.'
                }
                value={shareWebURLs}
              />
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
