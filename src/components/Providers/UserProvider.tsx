import React, {useEffect, useState} from 'react';
import {AppSettings} from '../../libraries/AppSettings';
import {startForegroundServiceWorker, stopForegroundServiceWorker} from '../../libraries/Service';
import {UserContext} from '../Contexts/UserContext';
import {DefaultProviderProps} from './ProviderTypes';

export const UserProvider = ({children}: DefaultProviderProps) => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // @TODO move the logic to the detailed logincontext type that Ben talked about.
  useEffect(() => {
    console.log('Calling useEffect from Main App.');
    async function checkForLogin() {
      if (!!(await AppSettings.USERNAME.getValue()) && !!(await AppSettings.AUTH_TOKEN.getValue())) {
        setIsUserLoggedIn(true);
        startForegroundServiceWorker().catch(error => {
          console.error('Error starting FGS:', error);
        });
      } else {
        stopForegroundServiceWorker().catch(error => {
          console.error('Error stopping FGS:', error);
        });
      }
    }
    checkForLogin().catch(console.error);
  }, [isUserLoggedIn]);

  return <UserContext.Provider value={{isUserLoggedIn, setIsUserLoggedIn}}>{children}</UserContext.Provider>;
};
