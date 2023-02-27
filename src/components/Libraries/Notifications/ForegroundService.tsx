import React from 'react';
import {startForegroundServiceWorker, stopForegroundServiceWorker} from "../../../libraries/Service";
import {useErrorHandler} from "../../Context/Contexts/ErrorHandlerContext";

interface ForegroundServicePropsType {
  isLoading: boolean;
  enable: boolean;
}

export const ForegroundService = ({isLoading, enable}: ForegroundServicePropsType) => {
  const {setErrorMessage} = useErrorHandler();
  console.log('Foreground Service Enter');

  if (isLoading) {
    return null;
  }

  console.debug('Loading', isLoading);
  console.debug('Enable', enable);

  if (!isLoading && enable) {
    console.log('Starting FGS');
    startForegroundServiceWorker().catch(error => setErrorMessage(error.toString()));
  } else {
    console.log('Stopping FGS');
    stopForegroundServiceWorker().catch(error => setErrorMessage(error.toString()));
  }

  return null;
};
