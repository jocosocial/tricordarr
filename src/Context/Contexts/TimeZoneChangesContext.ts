import {createContext, useContext} from 'react';

export type TimeZoneChangesContextType = {
  reload: () => Promise<void>;
};

export const TimeZoneChangesContext = createContext<TimeZoneChangesContextType>({
  reload: async () => {},
});

export const useTimeZoneChangesContext = () => useContext(TimeZoneChangesContext);
