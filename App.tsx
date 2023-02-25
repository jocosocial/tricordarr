/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {createContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {setupChannels} from './src/notifications/Channels';
import {AppSettings, initialSettings} from './src/libraries/AppSettings';
import {twitarrTheme, twitarrThemeDark} from './src/styles/Theme';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {apiQueryV3, setupAxiosStuff} from './src/libraries/APIClient';
import {startForegroundServiceWorker, stopForegroundServiceWorker} from './src/libraries/Service';
import {useColorScheme} from 'react-native';
import {BottomTabNavigator} from './src/components/Tabs/BottomTabNavigator/BottomTabNavigator';
import {UserDataContextType, UserDataContext} from './src/components/Contexts/UserDataContext';
import {ProfilePublicData, UserNotificationData} from './src/libraries/structs/ControllerStructs';

// https://tanstack.com/query/latest/docs/react/overview
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: apiQueryV3,
      cacheTime: 0,
    },
  },
});
setupAxiosStuff();

export const UserContext = createContext({});




// const defaultUserContext: UserDataContextType = {
//   setUserData(): {} {
//     return {};
//   },
//   userData: {
//     publicProfileData: {} as ProfilePublicData,
//     userNotificationData: {} as UserNotificationData,
//   },
// };
// const initialUserDataContextState = {
//   // userData: {
//   //   userNotificationData: {} as UserNotificationData,
//   //   publicProfileData: {} as ProfilePublicData,
//   // },
//   // userData: {} as UserNotificationData,
//   // userData: {},
//   data: '',
//   setData: () => {},
// };

function App(): JSX.Element {
  const colorScheme = useColorScheme();

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  // https://www.carlrippon.com/typed-usestate-with-typescript/
  // https://www.typescriptlang.org/docs/handbook/jsx.html
  // const [userData, setUserData] = useState(initialUserDataContextState);

  setupChannels().catch(error => {
    console.error('Error setting up notification channels:', error);
  });

  initialSettings().catch(error => {
    console.error('Error with settings:', error);
  });

  startForegroundServiceWorker().catch(error => {
    console.error('Error starting FGS:', error);
  });

  // @TODO move the logic to the detailed logincontext type that Ben talked about.
  useEffect(() => {
    console.log('Calling useEffect from Main App.');
    async function checkForLogin() {
      if (!!(await AppSettings.USERNAME.getValue()) && !!(await AppSettings.AUTH_TOKEN.getValue())) {
        setIsUserLoggedIn(true);
        startForegroundServiceWorker().catch(error => {
          console.error('Error starting FGS:', error);
        });
      } else {
        stopForegroundServiceWorker().catch(error => {
          console.error('Error stopping FGS:', error);
        });
      }
    }
    checkForLogin().catch(console.error);
  }, [isUserLoggedIn]);

  return (
    <NavigationContainer>
      <PaperProvider theme={colorScheme === 'dark' ? twitarrThemeDark : twitarrTheme}>
        <QueryClientProvider client={queryClient}>
          <UserContext.Provider value={{isUserLoggedIn, setIsUserLoggedIn}}>
            {/*<UserDataContext.Provider value={{data, setUserData}}>*/}
              <BottomTabNavigator />
            {/*</UserDataContext.Provider>*/}
          </UserContext.Provider>
        </QueryClientProvider>
      </PaperProvider>
    </NavigationContainer>
  );
}

export default App;
