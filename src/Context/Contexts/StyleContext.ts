import {type StackNavigationOptions} from '@react-navigation/stack';
import {createContext, useContext} from 'react';

import type {CommonStyles, StyleDefaults} from '#src/Context/Providers/StyleProvider';

interface StyleContextType {
  commonStyles: CommonStyles;
  styleDefaults: StyleDefaults;
  screenOptions: StackNavigationOptions;
}

export const StyleContext = createContext<StyleContextType>({} as StyleContextType);

export const useStyles = () => useContext(StyleContext);
