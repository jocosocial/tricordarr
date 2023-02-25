import React, {useEffect} from 'react';
import {Text} from 'react-native-paper';
import {AppView} from './AppView';
import {useQuery} from '@tanstack/react-query';
import {useIsFocused} from '@react-navigation/native';
import {AppSettings} from '../../libraries/AppSettings';
import {UserNotificationData} from '../../libraries/structs/ControllerStructs';

export const FetchUserData = () => {
  const {isLoading, error, data, refetch} = useQuery<UserNotificationData>({
    queryKey: ['/notification/global'],
  });

  const isFocused = useIsFocused();

  // https://upmostly.com/tutorials/setinterval-in-react-components-using-hooks
  // https://stackoverflow.com/questions/70300864/how-to-use-usequery-with-useeffect
  useEffect(() => {
    console.log('Renderless useEffect');
    console.log('Got Data:', data);
    // const userDataContext: UserNotificationData = data;
    // console.log('created data', userDataContext);
    try {
      AppSettings.SHIP_SSID.setValue(data.shipWifiSSID);
    } catch (e) {
      console.error(e);
    }
    const interval = setInterval(() => {
      console.log('This will run every ten seconds!');
      refetch();
    }, 10000);
    // This never actually renders at the moment because unmountOnBlur is not set, with good reasons.
    // https://reactnavigation.org/docs/bottom-tab-navigator/#unmountonblur
    // https://stackoverflow.com/questions/58696646/how-to-unmount-inactive-screens-in-bottom-tab-navigator-react-navigation
    return () => {
      console.log('Clearing Interval');
      clearInterval(interval);
    };
  }, [data, refetch]);
  useEffect(() => {
    console.log('Renderless useEffect');
    return () => console.log('Component Unmounted');
  }, []);

  useEffect(() => {
    console.log(isFocused);
  }, [isFocused]);

  if (isLoading) {
    return <></>;
  }
  if (error) {
    console.error('Renderless Fetch Error', error);
  }
  return <></>;
};

export const MainView = () => {
  return (
    <AppView>
      <Text variant={'titleLarge'}>Welcome to Boat!</Text>
      {/*<FetchUserData />*/}
    </AppView>
  );
};
