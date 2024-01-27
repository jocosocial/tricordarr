import {SeamailStack} from '../components/Navigation/Stacks/SeamailStackNavigator';
import {DisabledView} from '../components/Views/Static/DisabledView';
import {UserProfileScreen} from '../components/Screens/User/UserProfileScreen';
import React from 'react';
import {SwiftarrFeature} from './Enums/AppFeatures';
import {useFeature} from '../components/Context/Contexts/FeatureContext';

export type CommonStackParamList = {
  UserProfileScreen: {
    userID: string;
  };
};

export enum CommonComponents {
  userProfileScreen = 'UserProfileScreen',
}

export const CommonScreens = (Stack: typeof SeamailStack) => {
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
