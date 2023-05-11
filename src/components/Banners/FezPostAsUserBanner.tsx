import React from 'react';
import {Banner, Text} from 'react-native-paper';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {useAppTheme} from '../../styles/Theme';

export const FezPostAsUserBanner = () => {
  const {asPrivilegedUser} = usePrivilege();
  const theme = useAppTheme();

  const styles = {
    banner: {
      backgroundColor: theme.colors.errorContainer,
    },
    text: {
      color: theme.colors.onErrorContainer,
    },
  };

  return (
    <Banner visible={!!asPrivilegedUser} style={styles.banner}>
      <Text style={styles.text}>Posting as {asPrivilegedUser}</Text>
    </Banner>
  );
};
