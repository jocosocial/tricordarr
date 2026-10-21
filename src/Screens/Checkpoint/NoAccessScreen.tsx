import {PropsWithChildren} from 'react';

import {NoAccessView} from '#src/Components/Views/Static/NoAccessView';

interface NoAccessScreenProps extends PropsWithChildren {
  hasAccess: boolean | (() => boolean);
  message?: string;
  testID?: string;
}

/**
 * Generic checkpoint for privilege and role gates. Renders the children when the access
 * condition holds and a "no access" view otherwise. `hasAccess` takes either a boolean the
 * caller already computed or a predicate to evaluate at render time.
 *
 * Deliberately does not include LoggedInScreen: callers compose their own checkpoint chain,
 * the same as PreRegistrationScreen and DisabledFeatureScreen.
 */
export const NoAccessScreen = ({children, hasAccess, message, testID}: NoAccessScreenProps) => {
  const allowed = typeof hasAccess === 'function' ? hasAccess() : hasAccess;

  if (!allowed) {
    return <NoAccessView message={message} testID={testID} />;
  }
  return children;
};
