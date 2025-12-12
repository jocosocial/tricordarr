import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useDrawer} from '#src/Context/Contexts/DrawerContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {LfgStackComponents, LfgStackParamList} from '#src/Navigation/Stacks/LFGStackNavigator';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/PreRegistrationScreen';
import {LfgListScreen} from '#src/Screens/LFG/LfgListScreen';

type Props = StackScreenProps<LfgStackParamList, LfgStackComponents.lfgOwnedScreen>;

export const LfgOwnedScreen = (props: Props) => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.friendlyfez} urlPath={'/lfg/owned'}>
        <LfgOwnedScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const LfgOwnedScreenInner = ({navigation}: Props) => {
  const {getLeftMainHeaderButtons} = useDrawer();
  const {appConfig} = useConfig();

  useEffect(() => {
    if (appConfig.schedule.defaultLfgScreen === LfgStackComponents.lfgOwnedScreen) {
      navigation.setOptions({
        headerLeft: getLeftMainHeaderButtons,
      });
    }
  }, [appConfig.schedule.defaultLfgScreen, getLeftMainHeaderButtons, navigation]);

  return <LfgListScreen endpoint={'owner'} />;
};
