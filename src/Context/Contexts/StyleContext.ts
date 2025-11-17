import {type StackNavigationOptions} from '@react-navigation/stack';
import {createContext, useContext} from 'react';

import {type StyleDefaults} from '#src/Styles';

interface StyleContextType {
  commonStyles: any;
  styleDefaults: StyleDefaults;
  screenOptions: StackNavigationOptions;
}

export const StyleContext = createContext(<StyleContextType>{});

export const useStyles = () => useContext(StyleContext);
