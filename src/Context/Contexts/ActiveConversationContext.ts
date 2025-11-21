import {createContext, Dispatch, SetStateAction, useContext} from 'react';

interface ActiveConversationContextType {
  activeSeamailID?: string;
  setActiveSeamailID: Dispatch<SetStateAction<string | undefined>>;
  activeLfgID?: string;
  setActiveLfgID: Dispatch<SetStateAction<string | undefined>>;
  activePrivateEventID?: string;
  setActivePrivateEventID: Dispatch<SetStateAction<string | undefined>>;
}

export const ActiveConversationContext = createContext<ActiveConversationContextType>({
  activeSeamailID: undefined,
  setActiveSeamailID: () => {},
  activeLfgID: undefined,
  setActiveLfgID: () => {},
  activePrivateEventID: undefined,
  setActivePrivateEventID: () => {},
});

export const useActiveConversation = () => useContext(ActiveConversationContext);
