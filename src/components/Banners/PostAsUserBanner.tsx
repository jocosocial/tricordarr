import React from 'react';
import {Banner, Text} from 'react-native-paper';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {useAppTheme} from '../../styles/Theme';
import {useStyles} from '../Context/Contexts/StyleContext.ts';
import {StyleSheet} from 'react-native';

export const PostAsUserBanner = () => {
  const {asPrivilegedUser} = usePrivilege();
  const theme = useAppTheme();
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    banner: {
      ...commonStyles.errorContainer,
      ...commonStyles.safeMarginTop,
    },
    text: commonStyles.errorContainer,
  });

  return (
    <Banner visible={!!asPrivilegedUser} style={styles.banner}>
      <Text style={styles.text}>Posting as {asPrivilegedUser}</Text>
    </Banner>
  );
};
