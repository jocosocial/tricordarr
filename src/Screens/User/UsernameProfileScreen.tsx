import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';

import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUserFindQuery, useUsersProfileQuery} from '#src/Queries/Users/UsersQueries';
import {UserProfileScreenBase} from '#src/Screens/User/UserProfileScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.usernameProfileScreen>;

export const UsernameProfileScreen = ({route}: Props) => {
  const [userID, setUserID] = useState('');
  const {data: lookupData} = useUserFindQuery(route.params.username);
  const {data, refetch, isLoading} = useUsersProfileQuery(userID, {
    enabled: !!userID,
  });

  useEffect(() => {
    if (lookupData) {
      setUserID(lookupData.userID);
    }
  }, [lookupData]);

  return <UserProfileScreenBase data={data} refetch={refetch} isLoading={isLoading} />;
};
