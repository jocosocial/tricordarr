import React, {useEffect, useState, PropsWithChildren} from 'react';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {UserDataContext} from '../Contexts/UserDataContext';
import {useQuery} from '@tanstack/react-query';
import {useErrorHandler} from '../Contexts/ErrorHandlerContext';
import {AxiosError} from 'axios';
import {useAuth} from '../Contexts/AuthContext';

// https://reactnavigation.org/docs/auth-flow/
export const UserDataProvider = ({children}: PropsWithChildren) => {
  const [profilePublicData, setProfilePublicData] = useState<ProfilePublicData>();
  const {setErrorBanner} = useErrorHandler();
  const {tokenData} = useAuth();

  const {data: profileQueryData, error: profileQueryError} = useQuery<ProfilePublicData, AxiosError>({
    queryKey: ['/user/profile'],
  });

  useEffect(() => {
    if (tokenData && profileQueryData) {
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
