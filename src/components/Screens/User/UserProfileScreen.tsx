import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {useUserProfileQuery} from '../../Queries/Users/UserProfileQueries';
import {MainStackParamList} from '../../Navigation/Stacks/MainStack';
import {UserProfileScreenBase} from './UserProfileScreenBase';

export type Props = NativeStackScreenProps<
  MainStackParamList,
  MainStackComponents.userProfileScreen,
  NavigatorIDs.mainStack
>;

export const UserProfileScreen = ({route}: Props) => {
  const {data, refetch, isLoading} = useUserProfileQuery(route.params.userID);
  return <UserProfileScreenBase data={data} refetch={refetch} isLoading={isLoading} />;
};
