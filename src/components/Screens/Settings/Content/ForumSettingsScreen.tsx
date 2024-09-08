import React from 'react';
import {AppView} from '../../../Views/AppView.tsx';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView.tsx';
import {View} from 'react-native';
import {BooleanField} from '../../../Forms/Fields/BooleanField.tsx';
import {Formik} from 'formik';
import {useStyles} from '../../../Context/Contexts/StyleContext.ts';
import {useConfig} from '../../../Context/Contexts/ConfigContext.ts';

export const ForumSettingsScreen = () => {
  const {commonStyles} = useStyles();
  const {appConfig, updateAppConfig} = useConfig();
  const [reverseSwipeOrientation, setReverseSwipeOrientation] = React.useState(
    appConfig.userPreferences.reverseSwipeOrientation,
  );

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
      <ScrollingContentView>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <BooleanField
                name={'reverseSwipeOrientation'}
                label={'Reverse Swipe Orientation'}
                onPress={handleOrientation}
                style={commonStyles.paddingHorizontal}
                helperText={
                  'Switch the Left and Right swipe actions for swipeable items such as Forum Threads. Could be useful if you are left-handed.'
                }
                value={reverseSwipeOrientation}
              />
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
