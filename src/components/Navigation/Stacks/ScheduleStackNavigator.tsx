import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {EventSettingsScreen} from '../../Screens/Event/EventSettingsScreen';
import {useFeature} from '../../Context/Contexts/FeatureContext';
import {SwiftarrFeature} from '../../../libraries/Enums/AppFeatures';
import {DisabledView} from '../../Views/Static/DisabledView';
import {CommonScreens, CommonStackParamList} from '../CommonScreens';
import {MainStack} from './MainStackNavigator';
import {SchedulePrivateEventsScreen} from '../../Screens/Schedule/SchedulePrivateEventsScreen.tsx';
import {ScheduleDayScreen} from '../../Screens/Schedule/ScheduleDayScreen.tsx';
import {useDrawer} from '../../Context/Contexts/DrawerContext.ts';

export type ScheduleStackParamList = CommonStackParamList & {
  EventSettingsScreen: undefined;
  SchedulePrivateEventsScreen: undefined;
  ScheduleDayScreen: undefined;
};

export enum ScheduleStackComponents {
  eventSettingsScreen = 'EventSettingsScreen',
  schedulePrivateEventsScreen = 'SchedulePrivateEventsScreen',
  scheduleDayScreen = 'ScheduleDayScreen',
}

export const ScheduleStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<ScheduleStackParamList>();
  const {getLeftMainHeaderButtons} = useDrawer();
  const {getIsDisabled} = useFeature();
  const isDisabled = getIsDisabled(SwiftarrFeature.schedule);

  return (
    <Stack.Navigator
      initialRouteName={ScheduleStackComponents.scheduleDayScreen}
      screenOptions={{...screenOptions, headerShown: true}}>
      <Stack.Screen
        name={ScheduleStackComponents.eventSettingsScreen}
        component={EventSettingsScreen}
        options={{title: 'Schedule Settings'}}
      />
      <Stack.Screen
        name={ScheduleStackComponents.scheduleDayScreen}
        component={isDisabled ? DisabledView : ScheduleDayScreen}
        options={{
          headerLeft: getLeftMainHeaderButtons,
          title: 'Schedule',
        }}
      />
      <Stack.Screen
        name={ScheduleStackComponents.schedulePrivateEventsScreen}
        component={isDisabled ? DisabledView : SchedulePrivateEventsScreen}
        options={{title: 'Personal Events'}}
      />
      {CommonScreens(Stack as typeof MainStack)}
    </Stack.Navigator>
  );
};

export const useScheduleStackNavigation = () => useNavigation<NativeStackNavigationProp<ScheduleStackParamList>>();

export const useScheduleStackRoute = () => useRoute<RouteProp<ScheduleStackParamList>>();
