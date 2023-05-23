import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {UserNotificationData} from '../../../libraries/Structs/ControllerStructs';
import {UserNotificationDataActionsType} from '../../Reducers/Notification/UserNotificationDataReducer';

interface UserNotificationDataContextType {
  userNotificationData?: UserNotificationData;
  dispatchUserNotificationData: Dispatch<UserNotificationDataActionsType>;
  enableUserNotifications: boolean | null;
  setEnableUserNotifications: Dispatch<SetStateAction<boolean | null>>;
  refetchUserNotificationData: Function;
}

export const UserNotificationDataContext = createContext({} as UserNotificationDataContextType);

export const useUserNotificationData = () => useContext(UserNotificationDataContext);
