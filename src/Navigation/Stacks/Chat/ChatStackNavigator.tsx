import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ChatStackParamList, ChatStackScreenComponents} from '#src/Navigation/Stacks/Chat/ChatStackComponents';
import {CommonScreens} from '#src/Navigation/Stacks/Common/CommonScreens';
import {KrakenTalkReceiveScreen} from '#src/Screens/KrakenTalk/KrakenTalkReceiveScreen';

// Beware: https://github.com/react-navigation/react-navigation/issues/10802
const ChatStack = createStackNavigator<ChatStackParamList>();

export const ChatStackNavigator = () => {
  const {screenOptions} = useStyles();

  return (
    <ChatStack.Navigator initialRouteName={ChatStackScreenComponents.seamailListScreen} screenOptions={screenOptions}>
      <ChatStack.Screen
        name={ChatStackScreenComponents.krakenTalkReceiveScreen}
        component={KrakenTalkReceiveScreen}
        options={{title: 'Incoming Call'}}
      />
      {CommonScreens(ChatStack)}
    </ChatStack.Navigator>
  );
};
