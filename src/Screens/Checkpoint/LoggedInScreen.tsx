import {PropsWithChildren} from 'react';

import {NotLoggedInView} from '#src/Components/Views/Static/NotLoggedInView';
import {useSession} from '#src/Context/Contexts/SessionContext';

/**
 * Checkpoint screen to ensure that the user is logged in.
 */
export const LoggedInScreen = ({children}: PropsWithChildren) => {
  const {isLoggedIn} = useSession();
  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }
  return children;
};
