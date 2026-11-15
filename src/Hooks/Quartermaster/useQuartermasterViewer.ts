import {useMemo} from 'react';

import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {QuartermasterViewer} from '#src/Libraries/Quartermaster/QuartermasterAccess';

/**
 * The current user as seen by the Quartermastarr access rules. Memoized so it can be passed
 * to memoized list rows without defeating them.
 */
export const useQuartermasterViewer = (): QuartermasterViewer => {
  const {currentUserID} = useSession();
  const {hasModerator, hasVerified} = usePrivilege();
  return useMemo(
    () => ({userID: currentUserID, hasModerator, hasVerified}),
    [currentUserID, hasModerator, hasVerified],
  );
};
