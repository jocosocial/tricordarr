import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUserFindQuery, useUsersProfileQuery} from '#src/Queries/Users/UsersQueries';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {UserProfileScreenBase} from '#src/Screens/User/UserProfileScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.usernameProfileScreen>;

export const UsernameProfileScreen = (props: Props) => {
  return (
    <DisabledFeatureScreen feature={SwiftarrFeature.users} urlPath={`/username/${props.route.params.username}`}>
      <UsernameProfileScreenInner {...props} />
    </DisabledFeatureScreen>
  );
};

const UsernameProfileScreenInner = ({route}: Props) => {
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
