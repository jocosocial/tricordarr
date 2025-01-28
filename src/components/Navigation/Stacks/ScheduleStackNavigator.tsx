import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {EventSettingsScreen} from '../../Screens/Event/EventSettingsScreen';
import {useFeature} from '../../Context/Contexts/FeatureContext';
import {SwiftarrFeature} from '../../../libraries/Enums/AppFeatures';
import {DisabledView} from '../../Views/Static/DisabledView';
import {CommonScreens, CommonStackComponents, CommonStackParamList} from '../CommonScreens';
import {MainStack} from './MainStackNavigator';
import {SchedulePrivateEventsScreen} from '../../Screens/Schedule/SchedulePrivateEventsScreen.tsx';

export type ScheduleStackParamList = CommonStackParamList & {
  EventSettingsScreen: undefined;
  SchedulePrivateEventsScreen: undefined;
};

export enum ScheduleStackComponents {
  eventSettingsScreen = 'EventSettingsScreen',
  schedulePrivateEventsScreen = 'SchedulePrivateEventsScreen',
}

export const ScheduleStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<ScheduleStackParamList>();
  // const {getLeftMainHeaderButtons} = useDrawer();
  const {getIsDisabled} = useFeature();
  const isDisabled = getIsDisabled(SwiftarrFeature.schedule);

  return (
    <Stack.Navigator
      initialRouteName={CommonStackComponents.scheduleDayScreen}
      screenOptions={{...screenOptions, headerShown: true}}>
      <Stack.Screen
        name={ScheduleStackComponents.eventSettingsScreen}
        component={EventSettingsScreen}
        options={{title: 'Schedule Settings'}}
      />

      <Stack.Screen
        name={ScheduleStackComponents.schedulePrivateEventsScreen}
        component={isDisabled ? DisabledView : SchedulePrivateEventsScreen}
        options={{title: 'Private Events'}}
      />
      {CommonScreens(Stack as typeof MainStack)}
    </Stack.Navigator>
  );
};

export const useScheduleStackNavigation = () => useNavigation<NativeStackNavigationProp<ScheduleStackParamList>>();

export const useScheduleStackRoute = () => useRoute<RouteProp<ScheduleStackParamList>>();
