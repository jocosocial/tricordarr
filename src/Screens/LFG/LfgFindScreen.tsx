import React, {useEffect} from 'react';
import {LfgListScreen} from '#src/Screens/LFG/LfgListScreen';
import {useDrawer} from '#src/Context/Contexts/DrawerContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LfgStackComponents, LfgStackParamList} from '#src/Navigation/Stacks/LFGStackNavigator';

export type Props = NativeStackScreenProps<LfgStackParamList, LfgStackComponents.lfgFindScreen>;

export const LfgFindScreen = ({navigation}: Props) => {
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
