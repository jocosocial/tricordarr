import React, {useEffect, useMemo} from 'react';
import {PropsWithChildren} from 'react';
import {AuthContext} from '../Contexts/AuthContext';
import {AuthActions, useAuthReducer} from '../../Reducers/Auth/AuthReducer';
import EncryptedStorage from 'react-native-encrypted-storage';
import {TokenStringData} from '../../../libraries/Structs/ControllerStructs';

export const AuthProvider = ({children}: PropsWithChildren) => {
  const [authState, dispatchAuthState] = useAuthReducer({
    isLoading: true,
    isSignout: false,
    tokenData: null,
  });

  useEffect(() => {
    const restoreTokenData = async () => {
      const tokenString = await EncryptedStorage.getItem('TOKEN_STRING_DATA');
      if (tokenString) {
        return JSON.parse(tokenString) as TokenStringData;
      }
    };
    restoreTokenData().then(tokenData => {
      if (tokenData) {
        dispatchAuthState({
          type: AuthActions.restore,
          tokenData: tokenData,
        });
      } else {
        console.log('No token data found in local encrypted storage');
      }
    });
  }, [dispatchAuthState]);

  // https://reactnavigation.org/docs/auth-flow/
  const authContext = useMemo(
    () => ({
      signIn: () => console.log('sign in'),
      signOut: () => console.log('sign out'),
      signUp: () => console.log('sign up'),
    }),
    [],
  );

  console.log('Auth State', authState);

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
};
