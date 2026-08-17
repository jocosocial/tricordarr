import {RouteProp} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonScreens} from '#src/Navigation/Stacks/Common/CommonScreens';
import {LfgStackComponents, LfgStackParamList} from '#src/Navigation/Stacks/Lfg/LfgStackComponents';
import {LfgListScreen} from '#src/Screens/LFG/LfgListScreen';
import {LfgSearchScreen} from '#src/Screens/LFG/LfgSearchScreen';
import {FezListEndpoints} from '#src/Types';

export const LfgStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createStackNavigator<LfgStackParamList>();
  const {appConfig} = useConfig();

  return (
    <Stack.Navigator
      initialRouteName={LfgStackComponents.lfgListScreen}
      screenOptions={{...screenOptions, headerShown: true}}>
      <Stack.Screen
        name={LfgStackComponents.lfgListScreen}
        component={LfgListScreen}
        initialParams={{endpoint: appConfig.schedule.defaultLfgList}}
        options={({route}: {route: RouteProp<LfgStackParamList, 'LfgListScreen'>}) => {
          const titleMap: Record<FezListEndpoints, string> = {
            open: 'Find Groups',
            joined: 'Joined Groups',
            owner: 'Your Groups',
            former: 'Former Groups',
          };
          return {
            title: titleMap[route.params.endpoint],
          };
        }}
      />
      <Stack.Screen
        name={LfgStackComponents.lfgSearchScreen}
        component={LfgSearchScreen}
        options={{title: 'Search LFGs'}}
      />
      {CommonScreens(Stack)}
    </Stack.Navigator>
  );
};
