import React from 'react';
import {Banner, Text} from 'react-native-paper';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {useAppTheme} from '../../styles/Theme';

export const FezPostAsUserBanner = () => {
  const {asPrivilegedUser} = usePrivilege();
  const theme = useAppTheme();

  const styles = {
    banner: {
      backgroundColor: theme.colors.twitarrNegativeButton,
    },
  };

  return (
    <Banner visible={!!asPrivilegedUser} style={styles.banner}>
      <Text>Posting as {asPrivilegedUser}</Text>
    </Banner>
  );
};
