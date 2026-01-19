import React from 'react';
import {FAB} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

interface HelpFABProps {
  icon: IconSource;
  label?: string;
}

export const HelpFAB = ({icon, label}: HelpFABProps) => {
  const {theme} = useAppTheme();

  return (
    <FAB
      visible={true}
      icon={icon}
      color={theme.colors.inverseOnSurface}
      style={{backgroundColor: theme.colors.inverseSurface, alignSelf: 'flex-start'}}
      label={label}
    />
  );
};
