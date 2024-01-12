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
import {HelperText, SegmentedButtons, Text} from 'react-native-paper';
import {LfgStackComponents} from '../../../libraries/Enums/Navigation';
import {SegmentedButtonType} from '../../../libraries/Types';
import {AppIcons} from '../../../libraries/Enums/Icons';

export const LfgSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const [hidePastLfgs, setHidePastLfgs] = useState(appConfig.schedule.hidePastLfgs);
  const {setLfgHidePastFilter} = useFilter();
  const {commonStyles} = useStyles();
  const [defaultScreen, setDefaultScreen] = useState(appConfig.schedule.defaultLfgScreen);

  const handleHidePastLfgs = () => {
    const newValue = !appConfig.schedule.hidePastLfgs;
    updateAppConfig({
      ...appConfig,
      schedule: {
        ...appConfig.schedule,
        hidePastLfgs: newValue,
      },
    });
    setHidePastLfgs(newValue);
    setLfgHidePastFilter(newValue);
  };

  const lfgDefaultButtons: SegmentedButtonType[] = [
    {
      value: LfgStackComponents.lfgFindScreen,
      label: 'Find',
      icon: AppIcons.lfgFind,
    },
    {
      value: LfgStackComponents.lfgJoinedScreen,
      label: 'Joined',
      icon: AppIcons.lfgJoined,
    },
    {
      value: LfgStackComponents.lfgOwnedScreen,
      label: 'Owned',
      icon: AppIcons.lfgOwned,
    },
    {
      value: LfgStackComponents.lfgHelpScreen,
      label: 'Help',
      icon: AppIcons.help,
    },
  ];

  const handleLfgDefaultScreen = (value: string) => {
    updateAppConfig({
      ...appConfig,
      schedule: {
        ...appConfig.schedule,
        defaultLfgScreen: value as LfgStackComponents,
      },
    });
    setDefaultScreen(value as LfgStackComponents);
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
        <PaddedContentView>
          <Text style={commonStyles.marginBottomSmall}>Default LFG Screen</Text>
          <SegmentedButtons buttons={lfgDefaultButtons} value={defaultScreen} onValueChange={handleLfgDefaultScreen} />
          <HelperText style={commonStyles.onBackground} type={'info'}>
            Changing this setting requires an app restart.
          </HelperText>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
