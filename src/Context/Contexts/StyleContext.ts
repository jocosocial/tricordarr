import {createContext, useContext} from 'react';

import {type StyleDefaults} from '#src/Styles';

interface StyleContextType {
  commonStyles: any;
  styleDefaults: StyleDefaults;
  screenOptions: any;
}

export const StyleContext = createContext(<StyleContextType>{});

export const useStyles = () => useContext(StyleContext);
