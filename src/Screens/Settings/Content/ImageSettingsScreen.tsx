import {Formik} from 'formik';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const ImageSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {commonStyles} = useStyles();
  const navigation = useCommonStack();
  const [loadFullFirst, setLoadFullFirst] = React.useState(appConfig.skipThumbnails);
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

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.photostreamHelpScreen)}
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
