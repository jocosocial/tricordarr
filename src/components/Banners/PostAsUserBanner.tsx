import React from 'react';
import {Banner, Text} from 'react-native-paper';
import {usePrivilege} from '#src/Components/Context/Contexts/PrivilegeContext.ts';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
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
