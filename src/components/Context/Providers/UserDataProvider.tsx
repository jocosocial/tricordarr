import React, {useEffect, useState, PropsWithChildren} from 'react';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {UserDataContext} from '../Contexts/UserDataContext';
import {useErrorHandler} from '../Contexts/ErrorHandlerContext';
import {useAuth} from '../Contexts/AuthContext';
import {useUserProfileQuery} from '../../Queries/User/UserQueries';

// https://reactnavigation.org/docs/auth-flow/
export const UserDataProvider = ({children}: PropsWithChildren) => {
  const [profilePublicData, setProfilePublicData] = useState<ProfilePublicData>();
  const {setErrorBanner} = useErrorHandler();
  const {tokenData} = useAuth();
  const {data: profileQueryData, error: profileQueryError} = useUserProfileQuery();

  useEffect(() => {
    if (tokenData && profileQueryData) {
      console.log('[UserDataProvider.tsx] Setting profile public data');
      setProfilePublicData(profileQueryData);
    }
    if (tokenData && profileQueryError && profileQueryError.response) {
      if (profileQueryError.response.status === 401) {
        setErrorBanner('You are not logged in (or your token is no longer valid). Please log in again.');
      }
    } else if (tokenData && profileQueryError) {
      setErrorBanner(profileQueryError.message);
    }
  }, [profileQueryData, profileQueryError, setErrorBanner, tokenData]);

  return (
    <UserDataContext.Provider
      value={{
        profilePublicData,
        setProfilePublicData,
      }}>
      {children}
    </UserDataContext.Provider>
  );
};
