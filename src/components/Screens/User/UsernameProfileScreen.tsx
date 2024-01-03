import React, {useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {useUserProfileQuery} from '../../Queries/Users/UserProfileQueries';
import {MainStackParamList} from '../../Navigation/Stacks/MainStack';
import {UserProfileScreenBase} from './UserProfileScreenBase';
import {useUserFindQuery} from '../../Queries/User/UserQueries';

export type Props = NativeStackScreenProps<
  MainStackParamList,
  MainStackComponents.usernameProfileScreen,
  NavigatorIDs.mainStack
>;

export const UsernameProfileScreen = ({route}: Props) => {
  const [userID, setUserID] = useState('');
  const {data: lookupData} = useUserFindQuery(route.params.username);
  const {data, refetch, isLoading} = useUserProfileQuery(userID, {
    enabled: !!userID,
  });

  useEffect(() => {
    if (lookupData) {
      setUserID(lookupData.userID);
    }
  }, [lookupData]);

  return <UserProfileScreenBase data={data} refetch={refetch} isLoading={isLoading} />;
};
