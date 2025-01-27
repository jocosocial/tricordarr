import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import {QueryKey} from '@tanstack/react-query';

interface SwiftarrQueryClientContextType {
  errorCount: number;
  setErrorCount: Dispatch<SetStateAction<number>>;
  disruptionDetected: boolean;
  ServerQueryClient: AxiosInstance;
  PublicQueryClient: AxiosInstance;
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
  queryKeyExtraData: QueryKey;
  publicGet: <TData, TQueryParams>(
    url: string,
    queryParams?: TQueryParams,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<TData>>;
  serverUrl: string;
}

export const SwiftarrQueryClientContext = createContext(<SwiftarrQueryClientContextType>{});

export const useSwiftarrQueryClient = () => useContext(SwiftarrQueryClientContext);
