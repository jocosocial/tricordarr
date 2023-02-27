import React, {useEffect, useState} from 'react';
import {ProfilePublicData, TokenStringData} from '../../../libraries/Structs/ControllerStructs';
import {DefaultProviderProps} from './ProviderTypes';
import {UserDataContext} from '../Contexts/UserDataContext';
import {AppSettings} from '../../../libraries/AppSettings';
import {useQuery} from '@tanstack/react-query';
import {useErrorHandler} from "../Contexts/ErrorHandlerContext";

// https://reactnavigation.org/docs/auth-flow/
export const UserDataProvider = ({children}: DefaultProviderProps) => {
  const [profilePublicData, setProfilePublicData] = useState({} as ProfilePublicData);
  // const [authToken, setAuthToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const {setErrorMessage} = useErrorHandler();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // console.debug('authToken', authToken);
  console.debug('isLoggedIn', isLoggedIn);
  console.debug('isLoading', isLoading);

  useEffect(() => {
    async function getSettings() {
      const tokenSetting = await AppSettings.AUTH_TOKEN.getValue();
      if (tokenSetting) {
        setIsLoggedIn(true);
      }
      setIsLoading(false);
    }
    getSettings().catch(error => setErrorMessage(error.toString()));
  }, [setErrorMessage]);

  const {data: profileQueryData} = useQuery<ProfilePublicData>({
    queryKey: ['/user/profile'],
    enabled: !isLoading && isLoggedIn,
  });

  useEffect(() => {
    if (!isLoading && isLoggedIn && profileQueryData) {
      setProfilePublicData(profileQueryData);
    }
  }, [isLoading, isLoggedIn, profileQueryData]);

  return (
    <UserDataContext.Provider
      value={{profilePublicData, setProfilePublicData, isLoggedIn, setIsLoggedIn, isLoading, setIsLoading}}>
      {children}
    </UserDataContext.Provider>
  );
};
