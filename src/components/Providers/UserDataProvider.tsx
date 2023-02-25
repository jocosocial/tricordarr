import React, {useEffect, useState} from 'react';
import {ProfilePublicData, TokenStringData} from '../../libraries/structs/ControllerStructs';
import {DefaultProviderProps} from './ProviderTypes';
import {UserDataContext} from '../Contexts/UserDataContext';
import {AppSettings} from '../../libraries/AppSettings';
import {useQuery} from "@tanstack/react-query";

async function storeCredentials(data: TokenStringData) {
  await AppSettings.AUTH_TOKEN.setValue(data.token);
  await AppSettings.USER_ID.setValue(data.userID);
}

async function storeUserData(data: ProfilePublicData) {
  await AppSettings.USERNAME.setValue(data.header.username);
}

export const UserDataProvider = ({children}: DefaultProviderProps) => {
  const [profilePublicData, setProfilePublicData] = useState({} as ProfilePublicData);
  const [tokenStringData, setTokenStringData] = useState({} as TokenStringData);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const {data} = useQuery<ProfilePublicData>({
    queryKey: ['/user/profile'],
    enabled: isLoggedIn,
  });

  useEffect(() => {
    console.log('tokenStringData was influenced');
    console.log(tokenStringData);
    console.log('Is Logged in?', isLoggedIn);
    if (tokenStringData.token) {
      storeCredentials(tokenStringData).then(() => setIsLoggedIn(true));
    } else {
      setIsLoggedIn(false);
    }
    if (data) {
      console.log('Profile Data:', data);
      setProfilePublicData(data);
    }
  }, [tokenStringData, isLoggedIn, data]);

  useEffect(() => {
    console.log('profilePublicData was influenced');
    if (profilePublicData.header && profilePublicData.header.username) {
      storeUserData(profilePublicData);
    }
  }, [profilePublicData]);

  return (
    <UserDataContext.Provider value={{profilePublicData, setProfilePublicData, tokenStringData, setTokenStringData}}>
      {children}
    </UserDataContext.Provider>
  );
};
