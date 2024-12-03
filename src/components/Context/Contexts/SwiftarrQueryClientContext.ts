import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {AxiosInstance, AxiosResponse} from 'axios';
import {apiGetProps, apiPostProps} from '../../../libraries/Network/APIClient.ts';

interface SwiftarrQueryClientContextType {
  errorCount: number;
  setErrorCount: Dispatch<SetStateAction<number>>;
  disruptionDetected: boolean;
  ServerQueryClient: AxiosInstance;
  apiGet: <TData, TQueryParams>(props: apiGetProps<TQueryParams>) => Promise<AxiosResponse<TData>>;
  apiPost: <TData = void, TBodyData = void, TQueryParams = void>(
    props: apiPostProps<TBodyData, TQueryParams>,
  ) => Promise<AxiosResponse<TData, TData>>;
  apiDelete: <TData = void>(url: string) => Promise<AxiosResponse<TData, TData>>;
}

export const SwiftarrQueryClientContext = createContext(<SwiftarrQueryClientContextType>{});

export const useSwiftarrQueryClient = () => useContext(SwiftarrQueryClientContext);
