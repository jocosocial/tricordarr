import {useEffect} from 'react';

import {useSession} from '#src/Context/Contexts/SessionContext';
import {createLogger} from '#src/Libraries/Logger';
import {useUserProfileQuery, useUserWhoamiQuery} from '#src/Queries/User/UserQueries';

const logger = createLogger('AccountIdentitySync.tsx');

/**
 * Keeps the active account's row current from /user/whoami and /user/profile: the username, avatar
 * and, importantly, access level, which the login-time
 * snapshot on the token lets go stale. Both queries are already used elsewhere (roles, the main
 * account menu), so this adds no requests of its own.
 *
 * Writes carry the session they were produced for; the reducer drops them if the user has since
 * switched, so a late response cannot touch the wrong account.
 */
export const AccountIdentitySync = () => {
  const {currentSession, currentAccount, isLoggedIn, updateAccountIdentity} = useSession();
  const {data: whoami} = useUserWhoamiQuery();
  const {data: profile} = useUserProfileQuery();
  const sessionID = currentSession?.sessionID;
  const accountID = currentAccount?.accountID;
  const username = currentAccount?.username;
  const userImage = currentAccount?.userImage;
  const accessLevel = currentAccount?.accessLevel;

  const whoamiUsername = whoami?.username;
  const whoamiAccessLevel = whoami?.accessLevel;
  const profileUserImage = profile?.header.userImage;
  const whoamiUserID = whoami?.userID;

  useEffect(() => {
    if (!isLoggedIn || !sessionID || !accountID || !whoamiUsername || !whoamiAccessLevel) {
      return;
    }
    if (whoamiUserID !== currentAccount?.userID) {
      return;
    }
    const patch = {
      ...(whoamiUsername !== username ? {username: whoamiUsername} : {}),
      ...(whoamiAccessLevel !== accessLevel ? {accessLevel: whoamiAccessLevel} : {}),
      ...(profileUserImage !== userImage ? {userImage: profileUserImage} : {}),
    };
    if (Object.keys(patch).length === 0) {
      return;
    }
    updateAccountIdentity(accountID, patch, sessionID).catch(error =>
      logger.error('Failed to update account identity:', error),
    );
  }, [
    isLoggedIn,
    sessionID,
    accountID,
    currentAccount?.userID,
    whoamiUserID,
    whoamiUsername,
    whoamiAccessLevel,
    profileUserImage,
    username,
    accessLevel,
    userImage,
    updateAccountIdentity,
  ]);

  return null;
};
