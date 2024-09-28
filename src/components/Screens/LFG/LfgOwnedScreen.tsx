import React, {useEffect} from 'react';
import {LfgListScreen} from './LfgListScreen';
import {useDrawer} from '../../Context/Contexts/DrawerContext';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {LfgStackComponents} from '../../../libraries/Enums/Navigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LfgStackParamList} from '../../Navigation/Stacks/LFGStackNavigator';

type Props = NativeStackScreenProps<LfgStackParamList, LfgStackComponents.lfgOwnedScreen>;

export const LfgOwnedScreen = ({navigation}: Props) => {
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
