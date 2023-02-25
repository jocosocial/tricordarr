import {createContext, Dispatch, SetStateAction} from 'react';
import {ProfilePublicData, UserNotificationData} from '../../libraries/structs/ControllerStructs';

export interface UserDataContextType {
  // userData: {
  //   userNotificationData: UserNotificationData;
  //   publicProfileData: ProfilePublicData;
  // };
  // userData: Partial<UserNotificationData>;
  data: string;
  setData: Dispatch<SetStateAction<UserDataContextType>>;
}

// export const initialUserDataContextState = {
//   userData: {
//     userNotificationData: <UserNotificationData>{},
//     publicProfileData: <ProfilePublicData>{},
//   },
//   setUserData: () => {},
// };

export const UserDataContext = createContext(<UserDataContextType>{});
