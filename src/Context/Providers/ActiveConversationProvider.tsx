import {PropsWithChildren, useState} from 'react';

import {ActiveConversationContext} from '#src/Context/Contexts/ActiveConversationContext';

/**
 * Track the currently active conversations. We define active as when the user is
 * actively viewing the chat. Viewing has implications for whether they should see certain
 * push notifications, whether certain notifications update the UI. If the user navigates
 * away from the chat (even to a details screen) then it's considered inactive.
 */
export const ActiveConversationProvider = ({children}: PropsWithChildren) => {
  const [activeSeamailID, setActiveSeamailID] = useState<string | undefined>(undefined);
  const [activeLfgID, setActiveLfgID] = useState<string | undefined>(undefined);
  const [activePrivateEventID, setActivePrivateEventID] = useState<string | undefined>(undefined);

  return (
    <ActiveConversationContext.Provider
      value={{
        activeSeamailID,
        setActiveSeamailID,
        activeLfgID,
        setActiveLfgID,
        activePrivateEventID,
        setActivePrivateEventID,
      }}>
      {children}
    </ActiveConversationContext.Provider>
  );
};
