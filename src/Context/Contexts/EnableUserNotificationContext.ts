import {createContext, Dispatch, SetStateAction, useContext} from 'react';

interface EnableUserNotificationContextType {
  enableUserNotifications: boolean | null;
  setEnableUserNotifications: Dispatch<SetStateAction<boolean | null>>;
}

export const EnableUserNotificationContext = createContext({} as EnableUserNotificationContextType);

export const useEnableUserNotification = () => useContext(EnableUserNotificationContext);
