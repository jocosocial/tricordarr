import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SeamailListScreen} from '../../Screens/Seamail/SeamailListScreen';
import {ChatStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useNavigation} from '@react-navigation/native';
import {KrakenTalkCreateScreen} from '../../Screens/KrakenTalk/KrakenTalkCreateScreen';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useDrawer} from '../../Context/Contexts/DrawerContext';
import {SeamailSearchScreen} from '../../Screens/Seamail/SeamailSearchScreen';
import {SeamailHelpScreen} from '../../Screens/Seamail/SeamailHelpScreen';
import {DisabledView} from '../../Views/Static/DisabledView';
import {useFeature} from '../../Context/Contexts/FeatureContext';
import {SwiftarrFeature} from '../../../libraries/Enums/AppFeatures';
import {KrakenTalkReceiveScreen} from '../../Screens/KrakenTalk/KrakenTalkReceiveScreen';
import {MainStack} from './MainStackNavigator';
import {CommonScreens, CommonStackParamList} from '../CommonScreens';
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
  SeamailHelpScreen: undefined;
  KrakenTalkReceiveScreen: {
    callID: string;
    callerUserID: string;
    callerUsername: string;
  };
  SeamailSettingsScreen: undefined;
};

const ChatStack = createNativeStackNavigator<ChatStackParamList>();

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
        name={ChatStackScreenComponents.seamailHelpScreen}
        component={SeamailHelpScreen}
        options={{title: 'Seamail Help'}}
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
