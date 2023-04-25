import React, {useEffect, useState, PropsWithChildren} from 'react';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {UserDataContext} from '../Contexts/UserDataContext';
import {AppSettings} from '../../../libraries/AppSettings';
import {useQuery} from '@tanstack/react-query';
import {useErrorHandler} from '../Contexts/ErrorHandlerContext';
import {AxiosError} from 'axios';
import {UserAccessLevel} from '../../../libraries/Enums/UserAccessLevel';

// https://reactnavigation.org/docs/auth-flow/
export const UserDataProvider = ({children}: PropsWithChildren) => {
  const [profilePublicData, setProfilePublicData] = useState({} as ProfilePublicData);
  const [isLoading, setIsLoading] = useState(true);
  const {setErrorMessage, setErrorBanner} = useErrorHandler();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessLevel, setAccessLevel] = useState<UserAccessLevel>(UserAccessLevel.unverified);
  const [isPrivileged, setIsPrivileged] = useState(false);

  useEffect(() => {
    async function getSettings() {
      const tokenSetting = await AppSettings.AUTH_TOKEN.getValue();
      if (tokenSetting) {
        setIsLoggedIn(true);
      }
      const accessLevelSetting = await AppSettings.ACCESS_LEVEL.getValue();
      if (accessLevelSetting) {
        // https://stackoverflow.com/questions/17380845/how-do-i-convert-a-string-to-enum-in-typescript
        setAccessLevel(UserAccessLevel[accessLevelSetting as keyof typeof UserAccessLevel]);
        setIsPrivileged(UserAccessLevel.isPrivileged(accessLevel));
      }
      setIsLoading(false);
    }
    getSettings().catch(error => setErrorMessage(error.toString()));
  }, [accessLevel, setErrorMessage]);

  const {data: profileQueryData, error: profileQueryError} = useQuery<ProfilePublicData, AxiosError>({
    queryKey: ['/user/profile'],
    enabled: !isLoading && isLoggedIn,
  });

  useEffect(() => {
    if (!isLoading && isLoggedIn && profileQueryData) {
      setProfilePublicData(profileQueryData);
    }
    if (!isLoading && profileQueryError && profileQueryError.response) {
      if (profileQueryError.response.status === 401) {
        setErrorBanner('You are not logged in (or your token is no longer valid). Please log in again.');
      }
    } else if (!isLoading && profileQueryError) {
      setErrorBanner(profileQueryError.message);
    }
  }, [isLoading, isLoggedIn, profileQueryData, profileQueryError, setErrorBanner]);

  return (
    <UserDataContext.Provider
      value={{
        profilePublicData,
        setProfilePublicData,
        isLoggedIn,
        setIsLoggedIn,
        isLoading,
        setIsLoading,
        accessLevel,
        setAccessLevel,
        isPrivileged,
        setIsPrivileged,
      }}>
      {children}
    </UserDataContext.Provider>
  );
};
