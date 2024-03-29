import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackComponents} from '../../../libraries/Enums/Navigation';
import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {MainScreen} from '../../Screens/Main/MainScreen';
import {SettingsStack, SettingsStackParamList} from './SettingsStack';
import {AboutScreen} from '../../Screens/Main/AboutScreen';
import {UserDirectoryScreen} from '../../Screens/User/UserDirectoryScreen';
import {DailyThemeData} from '../../../libraries/Structs/ControllerStructs';
import {useFeature} from '../../Context/Contexts/FeatureContext';
import {SwiftarrFeature} from '../../../libraries/Enums/AppFeatures';
import {DisabledView} from '../../Views/Static/DisabledView';
import {DailyThemeScreen} from '../../Screens/Main/DailyThemeScreen';
import {MainHelpScreen} from '../../Screens/Main/MainHelpScreen';
import {MainConductScreen} from '../../Screens/Main/MainConductScreen';
import {DailyThemesScreen} from '../../Screens/Main/DailyThemesScreen';
import {CommonScreens, CommonStackParamList} from '../CommonScreens';

export type MainStackParamList = CommonStackParamList & {
  MainScreen: undefined;
  MainSettingsScreen: NavigatorScreenParams<SettingsStackParamList>;
  AboutScreen: undefined;
  UserDirectoryScreen: undefined;
  DailyThemeScreen: {
    dailyTheme: DailyThemeData;
  };
  MainHelpScreen: undefined;
  MainConductScreen: undefined;
  DailyThemesScreen: undefined;
};

export const MainStack = createNativeStackNavigator<MainStackParamList>();

export const MainStackNavigator = () => {
  const {screenOptions} = useStyles();
  const {getIsDisabled} = useFeature();
  const isUsersDisabled = getIsDisabled(SwiftarrFeature.users);

  return (
    <MainStack.Navigator initialRouteName={MainStackComponents.mainScreen} screenOptions={screenOptions}>
      <MainStack.Screen name={MainStackComponents.mainScreen} component={MainScreen} options={{title: 'Today'}} />
      <MainStack.Screen
        name={MainStackComponents.mainSettingsScreen}
        component={SettingsStack}
        options={{headerShown: false}}
      />
      <MainStack.Screen
        name={MainStackComponents.aboutScreen}
        component={AboutScreen}
        options={{title: 'About Tricordarr'}}
      />
      <MainStack.Screen
        name={MainStackComponents.userDirectoryScreen}
        component={isUsersDisabled ? DisabledView : UserDirectoryScreen}
        options={{title: 'Directory'}}
      />
      <MainStack.Screen
        name={MainStackComponents.dailyThemeScreen}
        component={DailyThemeScreen}
        options={{title: 'Daily Theme'}}
      />
      <MainStack.Screen
        name={MainStackComponents.mainHelpScreen}
        component={MainHelpScreen}
        options={{title: 'Help'}}
      />
      <MainStack.Screen
        name={MainStackComponents.conductScreen}
        component={MainConductScreen}
        options={{title: 'Code of Conduct'}}
      />
      <MainStack.Screen
        name={MainStackComponents.dailyThemesScreen}
        component={DailyThemesScreen}
        options={{title: 'Daily Themes'}}
      />
      {CommonScreens(MainStack)}
    </MainStack.Navigator>
  );
};

export const useMainStack = () => useNavigation<NativeStackNavigationProp<MainStackParamList>>();
