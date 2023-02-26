import React, {useEffect, useState} from 'react';
import {ProfilePublicData, TokenStringData} from '../../../libraries/Structs/ControllerStructs';
import {DefaultProviderProps} from './ProviderTypes';
import {UserDataContext} from '../Contexts/UserDataContext';
import {AppSettings} from '../../../libraries/AppSettings';
import {useQuery} from '@tanstack/react-query';

export const UserDataProvider = ({children}: DefaultProviderProps) => {
  const [profilePublicData, setProfilePublicData] = useState({} as ProfilePublicData);
  const [tokenStringData, setTokenStringData] = useState({} as TokenStringData);
  const [isLoggedIn, setIsLoggedIn] = useState(undefined as unknown);

  const {data: profileQueryData} = useQuery<ProfilePublicData>({
    queryKey: ['/user/profile'],
    enabled: !!isLoggedIn,
  });

  // @TODO this maybe shouldnt be an effect.
  async function determineLoginStatus() {
    const state = !!(await AppSettings.AUTH_TOKEN.getValue());
    setIsLoggedIn(state);
    console.log('Is logged in?', state);
    return state;
  }

  // tokenStringData will only exist after a login.
  // I think this is a hack that continues to keep working.
  // Eventually move the store credential code here?
  useEffect(() => {
    console.log('tokenStringData triggered');
    console.log('Current token data:', tokenStringData);
    determineLoginStatus();
  }, [tokenStringData]);

  useEffect(() => {
    if (profileQueryData) {
      setProfilePublicData(profileQueryData);
    }
  }, [profileQueryData]);

  return (
    <UserDataContext.Provider
      value={{profilePublicData, setProfilePublicData, tokenStringData, setTokenStringData, isLoggedIn, setIsLoggedIn}}>
      {children}
    </UserDataContext.Provider>
  );
};
