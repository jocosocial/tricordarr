import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useDrawer} from '#src/Context/Contexts/DrawerContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {LfgStackComponents, LfgStackParamList} from '#src/Navigation/Stacks/LFGStackNavigator';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {LfgListScreen} from '#src/Screens/LFG/LfgListScreen';

type Props = StackScreenProps<LfgStackParamList, LfgStackComponents.lfgOwnedScreen>;

export const LfgOwnedScreen = (props: Props) => {
  const {getLeftMainHeaderButtons} = useDrawer();
  const {appConfig} = useConfig();

  useEffect(() => {
    if (appConfig.schedule.defaultLfgScreen === LfgStackComponents.lfgOwnedScreen) {
      props.navigation.setOptions({
        headerLeft: getLeftMainHeaderButtons,
      });
    }
  }, [appConfig.schedule.defaultLfgScreen, getLeftMainHeaderButtons, props.navigation]);

  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.lfgHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.friendlyfez} urlPath={'/lfg/owned'}>
          <LfgListScreen endpoint={'owner'} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};
