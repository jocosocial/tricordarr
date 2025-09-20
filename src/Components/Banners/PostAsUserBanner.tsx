import React from 'react';
import {StyleSheet} from 'react-native';
import {Banner, Text} from 'react-native-paper';

import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';

export const PostAsUserBanner = () => {
  const {asPrivilegedUser} = usePrivilege();
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    banner: {
      ...commonStyles.errorContainer,
    },
    text: commonStyles.errorContainer,
  });

  return (
    <Banner visible={!!asPrivilegedUser} style={styles.banner}>
      <Text style={styles.text}>Posting as {asPrivilegedUser}</Text>
    </Banner>
  );
};
