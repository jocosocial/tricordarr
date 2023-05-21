import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {UserNotificationData} from '../../../libraries/./Structs/ControllerStructs';

interface UserNotificationDataContextType {
  userNotificationData?: UserNotificationData;
  setUserNotificationData: Dispatch<SetStateAction<UserNotificationData | undefined>>;
  enableUserNotifications: boolean | null;
  setEnableUserNotifications: Dispatch<SetStateAction<boolean | null>>;
}

export const UserNotificationDataContext = createContext({} as UserNotificationDataContextType);

export const useUserNotificationData = () => useContext(UserNotificationDataContext);
