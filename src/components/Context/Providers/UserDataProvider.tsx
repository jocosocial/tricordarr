import React, {useEffect, useState, PropsWithChildren} from 'react';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {UserDataContext} from '../Contexts/UserDataContext';
import {useErrorHandler} from '../Contexts/ErrorHandlerContext';
import {useAuth} from '../Contexts/AuthContext';
import {useUserProfileQuery} from '../../Queries/Users/UserProfileQueries.ts';
import {useConfig} from '../Contexts/ConfigContext.ts';

// https://reactnavigation.org/docs/auth-flow/
export const UserDataProvider = ({children}: PropsWithChildren) => {
  const [profilePublicData, setProfilePublicData] = useState<ProfilePublicData>();
  const {setErrorBanner} = useErrorHandler();
  const {preRegistrationMode} = useConfig();
  const {tokenData} = useAuth();
  const {data: profileQueryData, error: profileQueryError} = useUserProfileQuery(tokenData?.userID, {
    enabled: preRegistrationMode ? false : !!tokenData,
  });

  useEffect(() => {
    if (tokenData && profileQueryData) {
      console.log('[UserDataProvider.tsx] Setting profile public data');
      setProfilePublicData(profileQueryData);
    }
    if (tokenData && profileQueryError && profileQueryError.response) {
      if (profileQueryError.response.status === 401) {
        setErrorBanner('You are not logged in (or your token is no longer valid). Please log in again.');
      }
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
