import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {useDrawer} from '#src/Context/Contexts/DrawerContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ChatStackParamList, ChatStackScreenComponents} from '#src/Navigation/Stacks/Chat/ChatStackComponents';
import {CommonScreens} from '#src/Navigation/Stacks/Common/CommonScreens';
import {KrakenTalkReceiveScreen} from '#src/Screens/KrakenTalk/KrakenTalkReceiveScreen';
import {SeamailListScreen} from '#src/Screens/Seamail/SeamailListScreen';
import {SeamailSearchScreen} from '#src/Screens/Seamail/SeamailSearchScreen';

// Beware: https://github.com/react-navigation/react-navigation/issues/10802
const ChatStack = createStackNavigator<ChatStackParamList>();

export const ChatStackNavigator = () => {
  const {screenOptions} = useStyles();
  const {getLeftMainHeaderButtons} = useDrawer();

  return (
    <ChatStack.Navigator initialRouteName={ChatStackScreenComponents.seamailListScreen} screenOptions={screenOptions}>
      <ChatStack.Screen
        name={ChatStackScreenComponents.seamailListScreen}
        component={SeamailListScreen}
        options={{
          headerLeft: getLeftMainHeaderButtons,
          title: 'Seamail',
        }}
      />
      <ChatStack.Screen
        name={ChatStackScreenComponents.seamailSearchScreen}
        component={SeamailSearchScreen}
        options={{title: 'Search Seamail'}}
      />
      <ChatStack.Screen
        name={ChatStackScreenComponents.krakenTalkReceiveScreen}
        component={KrakenTalkReceiveScreen}
        options={{title: 'Incoming Call'}}
      />
      {CommonScreens(ChatStack)}
    </ChatStack.Navigator>
  );
};
