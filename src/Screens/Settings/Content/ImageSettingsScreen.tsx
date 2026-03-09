import {Formik} from 'formik';
import React from 'react';
import {View} from 'react-native';

import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {SliderField} from '#src/Components/Forms/Fields/SliderField';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';

export const ImageSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {commonStyles} = useStyles();
  const [loadFullFirst, setLoadFullFirst] = React.useState(appConfig.skipThumbnails);
  const [imagePreloadDelaySeconds, setImagePreloadDelaySeconds] = React.useState(appConfig.imagePreloadDelaySeconds);
  const [autosavePhotos, setAutosavePhotos] = React.useState(appConfig.userPreferences.autosavePhotos);

  const handleLoadFullFirst = () => {
    const newvalue = !appConfig.skipThumbnails;
    updateAppConfig({
      ...appConfig,
      skipThumbnails: newvalue,
    });
    setLoadFullFirst(newvalue);
  };

  const handleAutosavePhotos = () => {
    const newvalue = !appConfig.userPreferences.autosavePhotos;
    updateAppConfig({
      ...appConfig,
      userPreferences: {
        ...appConfig.userPreferences,
        autosavePhotos: newvalue,
      },
    });
    setAutosavePhotos(newvalue);
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <BooleanField
                name={'skipThumbnails'}
                label={'Load Full-Size Images First'}
                onPress={handleLoadFullFirst}
                style={commonStyles.paddingHorizontalSmall}
                helperText={'Skip loading image thumbnails first and instead load the full-size image.'}
                value={loadFullFirst}
              />
              <SliderField
                name={'imagePreloadDelaySeconds'}
                label={'Full-Size Image Preload Delay'}
                value={imagePreloadDelaySeconds}
                minimumValue={0}
                maximumValue={10}
                step={1}
                unit={'second'}
                helperText={
                  'Wait this long after showing a thumbnail before preloading the full-size image. Set to 0 to preload immediately.'
                }
                onValueChange={(value: number) => {
                  setImagePreloadDelaySeconds(value);
                }}
                onSlidingComplete={(value: number) => {
                  updateAppConfig({
                    ...appConfig,
                    imagePreloadDelaySeconds: value,
                  });
                }}
                style={commonStyles.paddingHorizontalSmall}
              />
              <BooleanField
                name={'autosavePhotos'}
                label={'Auto-Save Taken Photos'}
                onPress={handleAutosavePhotos}
                style={commonStyles.paddingHorizontalSmall}
                helperText={
                  "Automatically save photos taken with the camera in this app to your device's photo library."
                }
                value={autosavePhotos}
              />
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
