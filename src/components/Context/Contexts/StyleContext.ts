import {createContext, useContext} from 'react';

interface StyleContextType {
  commonStyles: any;
  styleDefaults: any;
  screenOptions: any;
}

export const StyleContext = createContext(<StyleContextType>{});

export const useStyles = () => useContext(StyleContext);
