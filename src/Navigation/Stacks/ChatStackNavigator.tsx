import {useNavigation} from '@react-navigation/native';
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack';
import React from 'react';

import {useDrawer} from '#src/Context/Contexts/DrawerContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonScreens, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {KrakenTalkCreateScreen} from '#src/Screens/KrakenTalk/KrakenTalkCreateScreen';
import {KrakenTalkReceiveScreen} from '#src/Screens/KrakenTalk/KrakenTalkReceiveScreen';
import {SeamailListScreen} from '#src/Screens/Seamail/SeamailListScreen';
import {SeamailSearchScreen} from '#src/Screens/Seamail/SeamailSearchScreen';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {WithScrollToTopIntent} from '#src/Types/RouteParams';

// Beware: https://github.com/react-navigation/react-navigation/issues/10802
export type ChatStackParamList = CommonStackParamList & {
  SeamailListScreen: WithScrollToTopIntent<{
    onlyNew?: boolean;
  }>;
  KrakenTalkCreateScreen?: {
    initialUserHeader?: UserHeader;
  };
  SeamailSearchScreen: {
    forUser?: string;
  };
  KrakenTalkReceiveScreen: {
    callID: string;
    callerUserID: string;
    callerUsername: string;
  };
};

const ChatStack = createStackNavigator<ChatStackParamList>();

export enum ChatStackScreenComponents {
  seamailListScreen = 'SeamailListScreen',
  krakentalkCreateScreen = 'KrakenTalkCreateScreen',
  seamailSearchScreen = 'SeamailSearchScreen',
  krakenTalkReceiveScreen = 'KrakenTalkReceiveScreen',
}

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
        name={ChatStackScreenComponents.krakentalkCreateScreen}
        component={KrakenTalkCreateScreen}
        options={{title: 'New Call'}}
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

export const useChatStack = () => useNavigation<StackNavigationProp<ChatStackParamList>>();
