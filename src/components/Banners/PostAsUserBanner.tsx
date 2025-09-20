import React from 'react';
import {Banner, Text} from 'react-native-paper';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext.ts';
import {useStyles} from '../Context/Contexts/StyleContext.ts';
import {StyleSheet} from 'react-native';

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
