import React, {useEffect, useState} from 'react';
import {ProfilePublicData, TokenStringData} from '../../../libraries/./Structs/ControllerStructs';
import {DefaultProviderProps} from './ProviderTypes';
import {UserDataContext} from '../Contexts/UserDataContext';
import {AppSettings} from '../../../libraries/AppSettings';
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
  const [isLoggedIn, setIsLoggedIn] = useState(undefined as unknown);

  // const {data} = useQuery<ProfilePublicData>({
  //   queryKey: ['/user/profile'],
  //   enabled: !!tokenStringData.token,
  // });
  // @TODO this maybe shouldnt be an effect.
  async function determineLoginStatus() {
    const state = !!(await AppSettings.AUTH_TOKEN.getValue());
    setIsLoggedIn(state);
    console.log('Is logged in?', state);
    return state;
  }

  useEffect(() => {
    console.log('tokenStringData triggered');
    console.log('Current token data:', tokenStringData);
    determineLoginStatus();
    // if (tokenStringData.token) {
    //   storeCredentials(tokenStringData);
    // }
  }, [tokenStringData]);

  useEffect(() => {
    console.log('profilePublicData triggered');
    console.log('Current public data:', profilePublicData);
    // console.log('received data', data);
  }, [profilePublicData]);

  //
  // useEffect(() => {
  //   console.log('tokenStringData was influenced');
  //   console.log(tokenStringData);
  //   console.log('Is Logged in?', isLoggedIn);
  //   if (tokenStringData.token) {
  //     storeCredentials(tokenStringData).then(() => setIsLoggedIn(true));
  //   } else {
  //     setIsLoggedIn(false);
  //   }
  //   if (data) {
  //     console.log('Profile Data:', data);
  //     setProfilePublicData(data);
  //   }
  // }, [tokenStringData, isLoggedIn, data]);
  //
  // useEffect(() => {
  //   console.log('profilePublicData was influenced');
  //   if (profilePublicData.header && profilePublicData.header.username) {
  //     storeUserData(profilePublicData);
  //   }
  // }, [profilePublicData]);

  return (
    <UserDataContext.Provider
      value={{profilePublicData, setProfilePublicData, tokenStringData, setTokenStringData, isLoggedIn, setIsLoggedIn}}>
      {children}
    </UserDataContext.Provider>
  );
};
