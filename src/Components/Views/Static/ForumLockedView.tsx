import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useAppTheme} from '#src/Styles/Theme';

export const ForumLockedView = () => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  const {hasModerator} = usePrivilege();

  const styles = StyleSheet.create({
    outerContainer: {
      ...commonStyles.error,
      ...commonStyles.flexRow,
      ...commonStyles.paddingVerticalSmall,
    },
    innerContainer: {
      ...commonStyles.alignItemsCenter,
      ...commonStyles.flex,
    },
    text: {
      ...commonStyles.onError,
      ...commonStyles.bold,
    },
  });

  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <Text style={styles.text}>This forum has been locked.</Text>
        {hasModerator && (
          <Text style={styles.text}>
            <AppIcon color={theme.colors.onError} icon={AppIcons.moderator} small={true} />
            &nbsp;Moderators can continue to post.
          </Text>
        )}
      </View>
    </View>
  );
};
