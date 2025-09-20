import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SeamailListScreen} from '../../Screens/Seamail/SeamailListScreen.tsx';
import {useNavigation} from '@react-navigation/native';
import {KrakenTalkCreateScreen} from '../../Screens/KrakenTalk/KrakenTalkCreateScreen.tsx';
import {UserHeader} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {useDrawer} from '../../Context/Contexts/DrawerContext.ts';
import {SeamailSearchScreen} from '../../Screens/Seamail/SeamailSearchScreen.tsx';
import {DisabledView} from '../../Views/Static/DisabledView.tsx';
import {useFeature} from '../../Context/Contexts/FeatureContext.ts';
import {SwiftarrFeature} from '../../../Libraries/Enums/AppFeatures.ts';
import {KrakenTalkReceiveScreen} from '../../Screens/KrakenTalk/KrakenTalkReceiveScreen.tsx';
import {MainStack} from './MainStackNavigator.tsx';
import {CommonScreens, CommonStackParamList} from '../CommonScreens.tsx';
import {SeamailSettingsScreen} from '../../Screens/Seamail/SeamailSettingsScreen.tsx';

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
