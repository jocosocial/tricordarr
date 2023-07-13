import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SeamailListScreen} from '../../Screens/Seamail/SeamailListScreen';
import {SeamailScreen} from '../../Screens/Seamail/SeamailScreen';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {SeamailDetailsScreen} from '../../Screens/Seamail/SeamailDetailsScreen';
import {UserProfileScreen} from '../../Screens/User/UserProfileScreen';
import {useNavigation} from '@react-navigation/native';
import {SeamailCreateScreen} from '../../Screens/Seamail/SeamailCreateScreen';
import {KrakenTalkCreateScreen} from '../../Screens/KrakenTalk/KrakenTalkCreateScreen';
import {FezData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {SeamailAddParticipantScreen} from '../../Screens/Seamail/SeamailAddParticipantScreen';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useDrawer} from '../../Context/Contexts/DrawerContext';

// Beware: https://github.com/react-navigation/react-navigation/issues/10802
export type SeamailStackParamList = {
  SeamailListScreen: undefined;
  SeamailScreen: {
    fezID: string;
    title: string;
  };
  SeamailDetailsScreen: {
    fezID: string;
  };
  UserProfileScreen: {
    userID: string;
    username: string;
  };
  SeamailCreateScreen?: {
    initialUserHeader?: UserHeader;
    initialAsModerator?: boolean;
    initialAsTwitarrTeam?: boolean;
  };
  KrakenTalkCreateScreen?: {
    initialUserHeader?: UserHeader;
  };
  SeamailAddParticipantScreen: {
    fez: FezData;
  };
};

export const SeamailStack = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<SeamailStackParamList>();
  const {getLeftMainHeaderButtons} = useDrawer();

  return (
    <Stack.Navigator initialRouteName={SeamailStackScreenComponents.seamailListScreen} screenOptions={screenOptions}>
      <Stack.Screen
        name={SeamailStackScreenComponents.seamailListScreen}
        component={SeamailListScreen}
        options={{
          headerLeft: getLeftMainHeaderButtons,
          title: 'Seamail',
        }}
      />
      <Stack.Screen
        name={SeamailStackScreenComponents.seamailScreen}
        component={SeamailScreen}
        // The simple headerTitle string below gets overwritten in the SeamailScreen component.
        // This is here as a performance optimization.
        // The reason it renders in the component is that deep linking doesnt pass in the title
        // so it has to figure it out.
        options={({route}) => ({
          headerTitle: route.params.title,
        })}
      />
      <Stack.Screen
        name={SeamailStackScreenComponents.seamailDetailsScreen}
        component={SeamailDetailsScreen}
        options={() => ({title: 'Seamail Details'})}
      />
      <Stack.Screen
        name={SeamailStackScreenComponents.userProfileScreen}
        component={UserProfileScreen}
        options={({route}) => ({title: route.params.username})}
      />
      <Stack.Screen
        name={SeamailStackScreenComponents.seamailCreateScreen}
        component={SeamailCreateScreen}
        options={{title: 'New Seamail'}}
      />
      <Stack.Screen
        name={SeamailStackScreenComponents.krakentalkCreateScreen}
        component={KrakenTalkCreateScreen}
        options={{title: 'New Call'}}
      />
      <Stack.Screen
        name={SeamailStackScreenComponents.seamailAddParticipantScreen}
        component={SeamailAddParticipantScreen}
        options={{title: 'Add Participant'}}
      />
    </Stack.Navigator>
  );
};

export const useSeamailStack = () => useNavigation<NativeStackNavigationProp<SeamailStackParamList>>();
