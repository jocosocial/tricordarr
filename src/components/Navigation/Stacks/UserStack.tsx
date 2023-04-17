// import React from 'react';
// import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
// import {UserStackScreenComponents} from '../../../libraries/Enums/Navigation';
// import {useAppTheme} from '../../../styles/Theme';
// import {UserProfileScreen} from '../../Screens/User/UserProfileScreen';
// import {useNavigation} from '@react-navigation/native';
//
// // Beware: https://github.com/react-navigation/react-navigation/issues/10802
// export type UserStackParamList = {
//   UserProfileScreen: {
//     userID: string;
//     username: string;
//   };
// };
//
// export const UserStack = () => {
//   const Stack = createNativeStackNavigator<UserStackParamList>();
//   const theme = useAppTheme();
//   const screenOptions = {
//     headerStyle: {
//       backgroundColor: theme.colors.background,
//     },
//     headerTitleStyle: {
//       color: theme.colors.onBackground,
//     },
//     headerTintColor: theme.colors.onBackground,
//   };
//
//   return (
//     <Stack.Navigator screenOptions={screenOptions}>
//       <Stack.Screen
//         name={UserStackScreenComponents.userProfileScreen}
//         component={UserProfileScreen}
//         options={({route}) => ({title: route.params.username})}
//       />
//     </Stack.Navigator>
//   );
// };
//
// export const useUserStack = () => useNavigation<NativeStackNavigationProp<UserStackParamList>>();
