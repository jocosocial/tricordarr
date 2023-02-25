import React, {useState, useEffect} from 'react';
import {UserNotificationDataContext} from '../Contexts/UserNotificationDataContext';
import {UserNotificationData} from '../../libraries/structs/ControllerStructs';
import {DefaultProviderProps} from './ProviderTypes';

// https://www.carlrippon.com/typed-usestate-with-typescript/
// https://www.typescriptlang.org/docs/handbook/jsx.html
export const UserNotificationDataProvider = ({children}: DefaultProviderProps) => {
  const [userNotificationData, setUserNotificationData] = useState({} as UserNotificationData);

  useEffect(() => {
    console.log('useEffect notification data');
    return () => {
      console.log('Notification provider has stopped.');
    };
  }, []);

  return (
    <UserNotificationDataContext.Provider value={{userNotificationData, setUserNotificationData}}>
      {children}
    </UserNotificationDataContext.Provider>
  );
};
