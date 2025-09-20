import React from 'react';
import {AppView} from '../../../Views/AppView.tsx';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView.tsx';
import {Formik} from 'formik';
import {View} from 'react-native';
import {BooleanField} from '../../../Forms/Fields/BooleanField.tsx';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView.tsx';
import {useConfig} from '../../../Context/Contexts/ConfigContext.ts';
import {useStyles} from '../../../Context/Contexts/StyleContext.ts';

export const ImageSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {commonStyles} = useStyles();
  const [loadFullFirst, setLoadFullFirst] = React.useState(appConfig.skipThumbnails);

  const handleLoadFullFirst = () => {
    const newvalue = !appConfig.skipThumbnails;
    updateAppConfig({
      ...appConfig,
      skipThumbnails: newvalue,
    });
    setLoadFullFirst(newvalue);
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <BooleanField
                name={'skipThumbnails'}
                label={'Load Full-Size Images First'}
                onPress={handleLoadFullFirst}
                style={commonStyles.paddingHorizontal}
                helperText={'Skip loading image thumbnails first and instead load the full-size image.'}
                value={loadFullFirst}
              />
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
