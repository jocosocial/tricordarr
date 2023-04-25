import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, Text} from 'react-native-paper';
import {SeamailListScreen} from '../../Screens/Seamail/SeamailListScreen';
import {SeamailScreen} from '../../Screens/Seamail/SeamailScreen';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {SeamailDetailsScreen} from '../../Screens/Seamail/SeamailDetailsScreen';
import {UserProfileScreen} from '../../Screens/User/UserProfileScreen';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {SeamailCreateScreen} from '../../Screens/Seamail/SeamailCreateScreen';
import {KrakenTalkCreateScreen} from '../../Screens/KrakenTalk/KrakenTalkCreateScreen';
import {TextStyle, TouchableOpacity, View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {NavHeaderTitle} from '../../Text/NavHeaderTitle';
import {FezDataProps} from '../../../libraries/Types';
import {SeamailHeaderTitle} from '../Components/SeamailHeaderTitle';

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
  SeamailCreateScreen: undefined;
  KrakenTalkCreateScreen: undefined;
};

// const getSeamailoptions = (route: RouteProp<SeamailStackParamList, 'SeamailScreen'>) => ({
//   headerTitle: () => <SeamailHeaderTitle fezID={route.params.fezID} title={route.params.title} />,
// });

const getHeader = (fezID: string, title: string) => <SeamailHeaderTitle fezID={fezID} title={title} />;

export const SeamailStack = () => {
  const Stack = createNativeStackNavigator<SeamailStackParamList>();
  const theme = useTheme();
  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
    headerTitleStyle: {
      color: theme.colors.onBackground,
    },
    headerTintColor: theme.colors.onBackground,
  };

  return (
    <Stack.Navigator initialRouteName={SeamailStackScreenComponents.seamailListScreen} screenOptions={screenOptions}>
      <Stack.Screen
        name={SeamailStackScreenComponents.seamailListScreen}
        component={SeamailListScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={SeamailStackScreenComponents.seamailScreen}
        component={SeamailScreen}
        // options={getSeamailoptions}
        options={({route}) => ({
          headerTitle: () => <SeamailHeaderTitle fezID={route.params.fezID} title={route.params.title} />,
        })}
        // options={({route}) => ({headerTitle: (route.params.fezID, route.params.title) => getHeaderTitle})}
        // options={({route}) => ({title: route.params.title})}
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
    </Stack.Navigator>
  );
};

export const useSeamailStack = () => useNavigation<NativeStackNavigationProp<SeamailStackParamList>>();
