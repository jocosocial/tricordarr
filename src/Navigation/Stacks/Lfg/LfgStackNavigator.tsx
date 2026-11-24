import {RouteProp} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonScreens} from '#src/Navigation/Stacks/Common/CommonScreens';
import {LfgStackComponents, LfgStackParamList} from '#src/Navigation/Stacks/Lfg/LfgStackComponents';
import {LfgListScreen} from '#src/Screens/LFG/LfgListScreen';
import {LfgSearchScreen} from '#src/Screens/LFG/LfgSearchScreen';

export const LfgStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createStackNavigator<LfgStackParamList>();

  return (
    <Stack.Navigator
      initialRouteName={LfgStackComponents.lfgListScreen}
      screenOptions={{...screenOptions, headerShown: true}}>
      <Stack.Screen
        name={LfgStackComponents.lfgListScreen}
        component={LfgListScreen}
        initialParams={{endpoint: 'all'}}
        options={({route}: {route: RouteProp<LfgStackParamList, 'LfgListScreen'>}) => ({
          // The title doesn't follow the Joined/Owned filter; only the separate Former list is named.
          title: route.params.endpoint === 'former' ? 'Former Groups' : 'Groups',
        })}
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
