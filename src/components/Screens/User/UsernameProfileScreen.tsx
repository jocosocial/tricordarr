import React, {useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useUserProfileQuery} from '../../Queries/Users/UserProfileQueries.ts';
import {UserProfileScreenBase} from './UserProfileScreenBase';
import {useUserFindQuery} from '../../Queries/User/UserQueries.ts';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.usernameProfileScreen>;

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
