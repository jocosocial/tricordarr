import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {UserProfileScreenBase} from '#src/Screens/User/UserProfileScreenBase';

export const UserSelfProfileScreen = () => {
  return (
    <DisabledFeatureScreen feature={SwiftarrFeature.users} urlPath={'/profile'}>
      <UserProfileScreenInner />
    </DisabledFeatureScreen>
  );
};

const UserProfileScreenInner = () => {
  const {data, refetch, isLoading} = useUserProfileQuery();
  return <UserProfileScreenBase data={data} refetch={refetch} isLoading={isLoading} />;
};
