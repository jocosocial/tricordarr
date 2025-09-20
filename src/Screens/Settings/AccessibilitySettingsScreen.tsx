import {Formik} from 'formik';
import React, {useState} from 'react';
import {View} from 'react-native';

import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';

export const AccessibilitySettingsScreen = () => {
  const {commonStyles} = useStyles();
  const {appConfig, updateAppConfig} = useConfig();
  const [useSystemTheme, setUseSystemTheme] = useState(appConfig.accessibility.useSystemTheme);
  const [darkMode, setDarkMode] = useState(appConfig.accessibility.darkMode);
  const [reverseSwipeOrientation, setReverseSwipeOrientation] = React.useState(
    appConfig.userPreferences.reverseSwipeOrientation,
  );

  const toggleSystemTheme = () => {
    const newValue = !appConfig.accessibility.useSystemTheme;
    updateAppConfig({
      ...appConfig,
      accessibility: {
        ...appConfig.accessibility,
        useSystemTheme: newValue,
      },
    });
    setUseSystemTheme(newValue);
  };

  const toggleDarkMode = () => {
    const newValue = !appConfig.accessibility.darkMode;
    updateAppConfig({
      ...appConfig,
      accessibility: {
        ...appConfig.accessibility,
        darkMode: newValue,
      },
    });
    setDarkMode(newValue);
  };

  const handleOrientation = () => {
    updateAppConfig({
      ...appConfig,
      userPreferences: {
        ...appConfig.userPreferences,
        reverseSwipeOrientation: !reverseSwipeOrientation,
      },
    });
    setReverseSwipeOrientation(!reverseSwipeOrientation);
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSection>
          <ListSubheader>Theme</ListSubheader>
        </ListSection>
        <Formik initialValues={{}} onSubmit={() => {}}>
          <View>
            <BooleanField
              name={'useSystemTheme'}
              label={'Use System Theme'}
              onPress={toggleSystemTheme}
              value={useSystemTheme}
              helperText={'Match your devices color scheme automatically.'}
              style={commonStyles.paddingHorizontal}
            />
            <BooleanField
              name={'darkMode'}
              label={'Dark Mode'}
              onPress={toggleDarkMode}
              value={darkMode}
              helperText={'White or light text on black or dark background.'}
              disabled={useSystemTheme}
              style={commonStyles.paddingHorizontal}
            />
          </View>
        </Formik>
        <ListSection>
          <ListSubheader>Interaction</ListSubheader>
        </ListSection>
        <Formik initialValues={{}} onSubmit={() => {}}>
          <View>
            <BooleanField
              name={'reverseSwipeOrientation'}
              label={'Reverse Swipe Orientation'}
              onPress={handleOrientation}
              style={commonStyles.paddingHorizontal}
              helperText={
                'Switch the Left and Right swipe actions for swipeable items such as Forum Threads and Seamails. Could be useful if you are left-handed.'
              }
              value={reverseSwipeOrientation}
            />
          </View>
        </Formik>
      </ScrollingContentView>
    </AppView>
  );
};
