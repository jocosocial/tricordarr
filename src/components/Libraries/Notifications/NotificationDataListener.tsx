import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {getSharedWebSocket} from '../../../libraries/Network/Websockets';
import {useQuery} from '@tanstack/react-query';
import {UserNotificationData} from '../../../libraries/Structs/ControllerStructs';
import {useCallback, useEffect} from 'react';
import {useAppState} from "../../Context/Contexts/AppStateContext";

export const NotificationDataListener = () => {
  const {setErrorMessage} = useErrorHandler();
  const {isLoading} = useUserData();
  const {enableUserNotifications, setUserNotificationData} = useUserNotificationData();
  const {appStateVisible} = useAppState();

  const {data, refetch} = useQuery<UserNotificationData>({
    queryKey: ['/notification/global'],
    enabled: !!enableUserNotifications,
  });

  const wsMessageHandler = useCallback(() => {
    console.log('UND Listener responding to message');
    refetch().catch(error => setErrorMessage(error.toString()));
  }, [refetch, setErrorMessage]);

  // This is a little hacky in several ways.
  // 1) Using the private WebSocket._listeners array to see if we already have a listener.
  // 2) Because this re-renders every time UserNotificationData updates we can ensure
  //    the listener actually gets set.
  // 3) It doesn't wait for the socket to be open or anything. It's been luck that it times well.
  // @TODO consider replacing with triggering based on notifee events.
  async function startWsListener() {
    console.log('Attempting to add UND WS listener');
    let ws = await getSharedWebSocket();
    if (ws) {
      // https://stackoverflow.com/questions/4587061/how-to-determine-if-object-is-in-array
      // console.log(ws._listeners);
      for (let i = 0; i < ws._listeners.message.length; i++) {
        if (ws._listeners.message[i] === wsMessageHandler) {
          console.log('wsMessageHandler is already present on socket.');
          return;
        }
      }
      ws.addEventListener('message', wsMessageHandler);
      console.log('Added NotificationDataListener to socket.');
    }
  }

  async function stopWsListener() {
    console.log('Attempting to remove UND WS listener');
    let ws = await getSharedWebSocket();
    if (ws) {
      ws.removeEventListener('message', wsMessageHandler);
      console.log('Removed NotificationDataListener from socket.');
    }
  }

  useEffect(() => {
    if (data) {
      setUserNotificationData(data);
    }
  }, [data, setUserNotificationData]);

  if (isLoading) {
    return null;
  }

  if (enableUserNotifications && appStateVisible === 'active') {
    startWsListener().catch(error => setErrorMessage(error.toString));
  } else {
    stopWsListener().catch(error => setErrorMessage(error.toString));
  }

  return null;
};
