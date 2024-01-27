import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SeamailListScreen} from '../../Screens/Seamail/SeamailListScreen';
import {SeamailScreen} from '../../Screens/Seamail/SeamailScreen';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {SeamailDetailsScreen} from '../../Screens/Seamail/SeamailDetailsScreen';
import {useNavigation} from '@react-navigation/native';
import {SeamailCreateScreen} from '../../Screens/Seamail/SeamailCreateScreen';
import {KrakenTalkCreateScreen} from '../../Screens/KrakenTalk/KrakenTalkCreateScreen';
import {FezData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {SeamailAddParticipantScreen} from '../../Screens/Seamail/SeamailAddParticipantScreen';
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

// Beware: https://github.com/react-navigation/react-navigation/issues/10802
export type SeamailStackParamList = CommonStackParamList & {
  SeamailListScreen: undefined;
  SeamailScreen: {
    fezID: string;
    title: string;
  };
  SeamailDetailsScreen: {
    fezID: string;
  };
  KrakenTalkCreateScreen?: {
    initialUserHeader?: UserHeader;
  };
  SeamailAddParticipantScreen: {
    fez: FezData;
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
};

const SeamailStack = createNativeStackNavigator<SeamailStackParamList>();

export const SeamailStackNavigator = () => {
  const {screenOptions} = useStyles();
  const {getLeftMainHeaderButtons} = useDrawer();
  const {getIsDisabled} = useFeature();
  const isDisabled = getIsDisabled(SwiftarrFeature.seamail);

  return (
    <SeamailStack.Navigator
      initialRouteName={SeamailStackScreenComponents.seamailListScreen}
      screenOptions={screenOptions}>
      <SeamailStack.Screen
        name={SeamailStackScreenComponents.seamailListScreen}
        component={isDisabled ? DisabledView : SeamailListScreen}
        options={{
          headerLeft: getLeftMainHeaderButtons,
          title: 'Seamail',
        }}
      />
      <SeamailStack.Screen
        name={SeamailStackScreenComponents.seamailScreen}
        component={isDisabled ? DisabledView : SeamailScreen}
        // The simple headerTitle string below gets overwritten in the SeamailScreen component.
        // This is here as a performance optimization.
        // The reason it renders in the component is that deep linking doesnt pass in the title
        // so it has to figure it out.
        options={{title: 'Seamail Chat'}}
      />
      <SeamailStack.Screen
        name={SeamailStackScreenComponents.seamailDetailsScreen}
        component={SeamailDetailsScreen}
        options={() => ({title: 'Seamail Details'})}
      />
      <SeamailStack.Screen
        name={SeamailStackScreenComponents.krakentalkCreateScreen}
        component={KrakenTalkCreateScreen}
        options={{title: 'New Call'}}
      />
      <SeamailStack.Screen
        name={SeamailStackScreenComponents.seamailAddParticipantScreen}
        component={SeamailAddParticipantScreen}
        options={{title: 'Add Participant'}}
      />
      <SeamailStack.Screen
        name={SeamailStackScreenComponents.seamailSearchScreen}
        component={SeamailSearchScreen}
        options={{title: 'Search Seamail'}}
      />
      <SeamailStack.Screen
        name={SeamailStackScreenComponents.seamailHelpScreen}
        component={SeamailHelpScreen}
        options={{title: 'Seamail Help'}}
      />
      <SeamailStack.Screen
        name={SeamailStackScreenComponents.krakenTalkReceiveScreen}
        component={KrakenTalkReceiveScreen}
        options={{title: 'Incoming Call'}}
      />
      {CommonScreens(SeamailStack as typeof MainStack)}
    </SeamailStack.Navigator>
  );
};

export const useSeamailStack = () => useNavigation<NativeStackNavigationProp<SeamailStackParamList>>();
