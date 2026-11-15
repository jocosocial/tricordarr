import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {usePublicMutation} from '#src/Queries/PublicMutation';
import {lookupUsernameOnServer, recoverAccountOnServer} from '#src/Queries/ServerAuth';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {UserRecoveryData, UserUsernameLookupData} from '#src/Structs/ControllerStructs';

/**
 * Reset an account's password on an explicit server. Like login, this does not go through the
 * session's API client: it is reached from the login form, which may be logging in to a server no
 * session points at yet (first-run setup, boarding, adding an account).
 */
export const useUserRecoveryMutation = () => {
  const {appConfig} = useConfig();

  const recoveryHandler = async ({serverUrl, ...recoveryData}: UserRecoveryData & {serverUrl: string}) => {
    return await recoverAccountOnServer(
      serverUrl,
      appConfig.urlPrefix,
      recoveryData,
      appConfig.apiClientConfig.mutationTimeout,
    );
  };

  return useTokenAuthMutation(recoveryHandler);
};

/**
 * Looks up the username of an account from its registration code plus either the account
 * password or the recovery key. For users who have those but have forgotten their username,
 * which `useUserRecoveryMutation` requires. Unauthenticated, hence `usePublicMutation`, and on an
 * explicit server for the same reason as `useUserRecoveryMutation`.
 */
export const useUsernameLookupMutation = () => {
  const {appConfig} = useConfig();

  const lookupHandler = async ({serverUrl, ...lookupData}: UserUsernameLookupData & {serverUrl: string}) => {
    return await lookupUsernameOnServer(
      serverUrl,
      appConfig.urlPrefix,
      lookupData,
      appConfig.apiClientConfig.mutationTimeout,
    );
  };

  return usePublicMutation(lookupHandler);
};
