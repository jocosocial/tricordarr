import {useEffect, useState} from 'react';
import {useAppState} from '../../Context/Contexts/AppStateContext';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {AppSettings} from '../../../libraries/AppSettings';
import {useQuery} from '@tanstack/react-query';
import {UserNotificationData} from '../../../libraries/Structs/ControllerStructs';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useUserData} from '../../Context/Contexts/UserDataContext';

export const NotificationDataListener = () => {
  const {setErrorMessage} = useErrorHandler();
  const {isLoading} = useUserData();
  const {enableUserNotifications} = useUserNotificationData();

  if (isLoading || enableUserNotifications === null) {
    return null;
  }

  console.log('Attaching listener');

  return null;
};
