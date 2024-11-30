import {Text} from 'react-native-paper';
import {AppView} from '../../Views/AppView.tsx';
import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.performerScreen>;

export const PerformerScreen = ({route}: Props) => {
  return (
    <AppView>
      <Text>{route.params.id}</Text>
    </AppView>
  );
};
