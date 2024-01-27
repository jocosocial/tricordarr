import {DisabledView} from '../Views/Static/DisabledView';
import {UserProfileScreen} from '../Screens/User/UserProfileScreen';
import React from 'react';
import {SwiftarrFeature} from '../../libraries/Enums/AppFeatures';
import {useFeature} from '../Context/Contexts/FeatureContext';
import {MainStack} from './Stacks/MainStackNavigator';

export type CommonStackParamList = {
  UserProfileScreen: {
    userID: string;
  };
};

export enum CommonComponents {
  userProfileScreen = 'UserProfileScreen',
}

export const CommonScreens = (Stack: typeof MainStack) => {
  const {getIsDisabled} = useFeature();
  const isUsersDisabled = getIsDisabled(SwiftarrFeature.users);

  return (
    <>
      <Stack.Screen
        name={CommonComponents.userProfileScreen}
        component={isUsersDisabled ? DisabledView : UserProfileScreen}
        options={{title: 'User Profile'}}
      />
    </>
  );
};
