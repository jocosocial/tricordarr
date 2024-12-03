import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';

interface SwiftarrQueryClientContextType {
  errorCount: number;
  setErrorCount: Dispatch<SetStateAction<number>>;
  disruptionDetected: boolean;
  ServerQueryClient: AxiosInstance;
  apiGet: <TData, TQueryParams>(
    url: string,
    queryParams?: TQueryParams,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<TData>>;
  apiPost: <TResponseData = void, TRequestData = void>(
    url: string,
    body?: TRequestData | undefined,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<TResponseData, TResponseData>>;
  apiDelete: <TResponseData = void>(url: string) => Promise<AxiosResponse<TResponseData, TResponseData>>;
}

export const SwiftarrQueryClientContext = createContext(<SwiftarrQueryClientContextType>{});

export const useSwiftarrQueryClient = () => useContext(SwiftarrQueryClientContext);
