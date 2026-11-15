import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';

import {getEffectiveConfig} from '#src/Libraries/EffectiveConfig';
import {createLogger} from '#src/Libraries/Logger';
import {getAuthHeaders} from '#src/Libraries/Network/APIClient';
import {getApiClientHeaders} from '#src/Libraries/Network/ClientHeaders';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';
import {joinUrl} from '#src/Libraries/UrlParser';

const logger = createLogger('HeadlessApi.ts');

/**
 * The `apiGet` counterpart for code with no React tree (or API client) to use, such as a
 * background notification action. Resolves the server and token for the active account the same
 * way the push providers do, through LAST_SESSION_ID, and sends the same headers as the session's
 * API client. Resolves to undefined, without a request, when there is no signed-in session.
 */
export const headlessApiGet = async <TData, TQueryParams = undefined>(
  url: string,
  queryParams?: TQueryParams,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<TData> | undefined> => {
  const [session, effectiveConfig] = await Promise.all([SessionStorage.getCurrentSession(), getEffectiveConfig()]);
  const tokenData = session?.accountID ? await SessionStorage.getTokenForAccount(session.accountID) : null;
  if (!session || !tokenData) {
    logger.warn('Cannot make a headless request without a session and token:', url);
    return undefined;
  }
  return await axios.get<TData>(url, {
    baseURL: joinUrl(session.serverUrl, effectiveConfig.urlPrefix),
    headers: {
      ...getAuthHeaders(undefined, undefined, tokenData.token),
      'X-Swiftarr-User': tokenData.userID,
      ...getApiClientHeaders(),
    },
    timeout: effectiveConfig.apiClientConfig.requestTimeout,
    timeoutErrorMessage: 'Tricordarr/Axios request timeout.',
    params: queryParams,
    ...config,
  });
};
