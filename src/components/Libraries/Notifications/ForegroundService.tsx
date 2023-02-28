import React from 'react';
import {startForegroundServiceWorker, stopForegroundServiceWorker} from "../../../libraries/Service";
import {useErrorHandler} from "../../Context/Contexts/ErrorHandlerContext";

interface ForegroundServicePropsType {
  isLoading: boolean;
  enable: boolean | null;
}

export const ForegroundService = ({isLoading, enable}: ForegroundServicePropsType) => {
  const {setErrorMessage} = useErrorHandler();

  if (isLoading || enable === null) {
    return null;
  }

  console.debug('FGS Loading', isLoading);
  console.debug('FGS Enable', enable);

  if (!isLoading && enable) {
    console.log('Starting FGS');
    startForegroundServiceWorker().catch(error => setErrorMessage(error.toString()));
  } else {
    console.log('Stopping FGS');
    stopForegroundServiceWorker().catch(error => setErrorMessage(error.toString()));
  }

  return null;
};
