import React, {useEffect, useState, useRef} from 'react';
import {AppState} from 'react-native';
import {DefaultProviderProps} from './ProviderTypes';
import {AppStateContext} from '../Contexts/AppStateContext';

// https://reactnative.dev/docs/appstate
export const AppStateProvider = ({children}: DefaultProviderProps) => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <AppStateContext.Provider value={{appState, appStateVisible, setAppStateVisible}}>
      {children}
    </AppStateContext.Provider>
  );
};
