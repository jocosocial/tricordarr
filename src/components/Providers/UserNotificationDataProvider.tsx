import React, {ReactNode, useState, useEffect} from 'react';
import {UserNotificationDataContext} from '../Contexts/UserNotificationDataContext';
import {UserNotificationData} from '../../libraries/structs/ControllerStructs';

// https://stackoverflow.com/questions/55370851/how-to-fix-binding-element-children-implicitly-has-an-any-type-ts7031
interface Props {
  children?: ReactNode;
}

// https://www.carlrippon.com/typed-usestate-with-typescript/
// https://www.typescriptlang.org/docs/handbook/jsx.html
export const UserNotificationDataProvider = ({children}: Props) => {
  const [userNotificationData, setUserNotificationData] = useState({} as UserNotificationData);

  // useEffect(() => {
  //   console.log('useEffect notification data');
  // }, []);

  return (
    <UserNotificationDataContext.Provider value={{userNotificationData, setUserNotificationData}}>
      {children}
    </UserNotificationDataContext.Provider>
  );
};
