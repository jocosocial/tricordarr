import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {UserNotificationData} from '../../libraries/structs/ControllerStructs';

interface UserNotificationDataContextType {
  userNotificationData: UserNotificationData;
  setUserNotificationData: Dispatch<SetStateAction<UserNotificationData>>;
  enableUserNotifications: boolean;
  setEnableUserNotifications: Dispatch<SetStateAction<boolean>>;
}

export const UserNotificationDataContext = createContext({} as UserNotificationDataContextType);

export const useUserNotificationData = () => useContext(UserNotificationDataContext);
