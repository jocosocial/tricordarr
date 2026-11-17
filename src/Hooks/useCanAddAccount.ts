import {useSession} from '#src/Context/Contexts/SessionContext';
import {MAX_ACCOUNTS} from '#src/Libraries/Account';

/**
 * Whether another account can be added to this device, per `MAX_ACCOUNTS`.
 */
export const useCanAddAccount = (): boolean => {
  const {accounts} = useSession();
  return accounts.length < MAX_ACCOUNTS;
};
