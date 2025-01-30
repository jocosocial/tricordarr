import React from 'react';
import {Text} from 'react-native-paper';
import {AppView} from '../../Views/AppView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';

type Props = NativeStackScreenProps<MainStackParamList, CommonStackComponents.performerCreateScreen>;

export const PerformerCreateScreen = ({route}: Props) => {
  return (
    <AppView>
      <Text>{route.params.performerType}</Text>
    </AppView>
  );
};
