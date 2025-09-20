import {createContext, Dispatch, SetStateAction, useContext} from 'react';

interface UserNotificationDataContextType {
  enableUserNotifications: boolean | null;
  setEnableUserNotifications: Dispatch<SetStateAction<boolean | null>>;
}

export const UserNotificationDataContext = createContext({} as UserNotificationDataContextType);

export const useUserNotificationData = () => useContext(UserNotificationDataContext);
