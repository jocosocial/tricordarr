import React from 'react';

import {BaseWarningView} from '#src/Components/Views/Warnings/BaseWarningView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';

interface BlockedOrMutedWarningViewProps {
  blocked?: boolean;
  muted?: boolean;
}

/**
 * Tells the current user, on a profile, that they have blocked or muted that user and what that means
 * for the content they see.
 */
export const BlockedOrMutedWarningView = ({blocked, muted}: BlockedOrMutedWarningViewProps) => {
  const {hasModerator} = usePrivilege();
  const moderatorMessage = 'You are a Moderator and will continue to see their content.';
  let title = 'User is ';
  let message: string;
  if (blocked) {
    title += muted ? 'Blocked and Muted' : 'Blocked';
    message = hasModerator
      ? `${moderatorMessage}\nThey will not see content from you.`
      : 'You will not see content from each other.';
  } else {
    title += 'Muted';
    message = hasModerator ? moderatorMessage : 'You will not see content from them.';
  }

  return <BaseWarningView variant={'error'} title={title} message={message} visible={!!blocked || !!muted} />;
};
