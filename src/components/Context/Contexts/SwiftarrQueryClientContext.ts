import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {AxiosInstance, AxiosResponse} from 'axios';
import {apiGetProps, apiPostProps} from '../../../libraries/Network/APIClient.ts';

interface SwiftarrQueryClientContextType {
  errorCount: number;
  setErrorCount: Dispatch<SetStateAction<number>>;
  disruptionDetected: boolean;
  ServerQueryClient: AxiosInstance;
  apiGet: <TData, TQueryParams>(props: apiGetProps<TQueryParams>) => Promise<AxiosResponse<TData, TData>>;
  apiPost: <TData, TQueryParams, TBodyData>(
    props: apiPostProps<TQueryParams, TBodyData>,
  ) => Promise<AxiosResponse<TData, TData>>;
}

export const SwiftarrQueryClientContext = createContext(<SwiftarrQueryClientContextType>{});

export const useSwiftarrQueryClient = () => useContext(SwiftarrQueryClientContext);
