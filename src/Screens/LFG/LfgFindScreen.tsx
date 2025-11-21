import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useDrawer} from '#src/Context/Contexts/DrawerContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {LfgStackComponents, LfgStackParamList} from '#src/Navigation/Stacks/LFGStackNavigator';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {LfgListScreen} from '#src/Screens/LFG/LfgListScreen';

export type Props = StackScreenProps<LfgStackParamList, LfgStackComponents.lfgFindScreen>;

export const LfgFindScreen = (props: Props) => {
  return (
    <DisabledFeatureScreen feature={SwiftarrFeature.friendlyfez} urlPath={'/lfg'}>
      <LfgFindScreenInner {...props} />
    </DisabledFeatureScreen>
  );
};

const LfgFindScreenInner = ({navigation}: Props) => {
  const {getLeftMainHeaderButtons} = useDrawer();
  const {appConfig} = useConfig();

  useEffect(() => {
    if (appConfig.schedule.defaultLfgScreen === LfgStackComponents.lfgFindScreen) {
      navigation.setOptions({
        headerLeft: getLeftMainHeaderButtons,
      });
    }
  }, [appConfig.schedule.defaultLfgScreen, getLeftMainHeaderButtons, navigation]);

  return <LfgListScreen endpoint={'open'} />;
};
