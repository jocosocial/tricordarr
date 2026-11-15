import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {loginToServer} from '#src/Queries/ServerAuth';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

interface LoginMutationProps {
  /** The server to log in to; never implied by the active session. */
  serverUrl: string;
  username: string;
  password: string;
}

/**
 * POST /auth/login on an explicit server. Does not go through the session's API client, so it
 * works for adding an account on a server no session points at yet.
 */
export const useLoginMutation = () => {
  const {appConfig} = useConfig();

  const queryHandler = async ({serverUrl, username, password}: LoginMutationProps) => {
    return await loginToServer(
      serverUrl,
      appConfig.urlPrefix,
      username,
      password,
      appConfig.apiClientConfig.mutationTimeout,
    );
  };

  return useTokenAuthMutation(queryHandler);
};
