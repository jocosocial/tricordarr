import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SeamailListScreen} from '#src/Screens/Seamail/SeamailListScreen';
import {useNavigation} from '@react-navigation/native';
import {KrakenTalkCreateScreen} from '#src/Screens/KrakenTalk/KrakenTalkCreateScreen';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useDrawer} from '#src/Context/Contexts/DrawerContext';
import {SeamailSearchScreen} from '#src/Screens/Seamail/SeamailSearchScreen';
import {DisabledView} from '#src/Components/Views/Static/DisabledView';
import {useFeature} from '#src/Context/Contexts/FeatureContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {KrakenTalkReceiveScreen} from '#src/Screens/KrakenTalk/KrakenTalkReceiveScreen';
import {MainStack} from '#src/Navigation/Stacks/MainStackNavigator';
import {CommonScreens, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {SeamailSettingsScreen} from '#src/Screens/Seamail/SeamailSettingsScreen';

// Beware: https://github.com/react-navigation/react-navigation/issues/10802
export type ChatStackParamList = CommonStackParamList & {
  SeamailListScreen: undefined;
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
  SeamailSettingsScreen: undefined;
};

const ChatStack = createNativeStackNavigator<ChatStackParamList>();

export enum ChatStackScreenComponents {
  seamailListScreen = 'SeamailListScreen',
  krakentalkCreateScreen = 'KrakenTalkCreateScreen',
  seamailSearchScreen = 'SeamailSearchScreen',
  krakenTalkReceiveScreen = 'KrakenTalkReceiveScreen',
  seamailSettingsScreen = 'SeamailSettingsScreen',
}

export const ChatStackNavigator = () => {
  const {screenOptions} = useStyles();
  const {getLeftMainHeaderButtons} = useDrawer();
  const {getIsDisabled} = useFeature();
  const isDisabled = getIsDisabled(SwiftarrFeature.seamail);

  return (
    <ChatStack.Navigator initialRouteName={ChatStackScreenComponents.seamailListScreen} screenOptions={screenOptions}>
      <ChatStack.Screen
        name={ChatStackScreenComponents.seamailListScreen}
        component={isDisabled ? DisabledView : SeamailListScreen}
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
      <ChatStack.Screen
        name={ChatStackScreenComponents.seamailSettingsScreen}
        component={SeamailSettingsScreen}
        options={{title: 'Seamail Settings'}}
      />
      {CommonScreens(ChatStack as typeof MainStack)}
    </ChatStack.Navigator>
  );
};

export const useChatStack = () => useNavigation<NativeStackNavigationProp<ChatStackParamList>>();
