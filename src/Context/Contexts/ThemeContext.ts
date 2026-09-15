import {DefaultTheme as NavigationDefaultTheme} from '@react-navigation/native';
import {createContext, useContext} from 'react';

import {type AppTheme, twitarrTheme} from '#src/Styles/Theme';

interface ThemeContextType {
  isDarkMode: boolean;
  theme: AppTheme;
  navTheme: ReactNavigation.Theme;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  theme: twitarrTheme,
  navTheme: NavigationDefaultTheme,
});

export const useAppTheme = () => useContext(ThemeContext);
