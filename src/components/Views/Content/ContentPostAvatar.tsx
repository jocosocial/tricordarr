import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs.tsx';
import {UserAvatarImage} from '../../Images/UserAvatarImage.tsx';

interface ContentPostAvatarProps {
  onPress?: () => void;
  userHeader: UserHeader;
}

/**
 * This is the small user avatars next to content posts.
 * Usually only shows up on the left side of the screen.
 */
export const ContentPostAvatar = (props: ContentPostAvatarProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    container: {
      ...commonStyles.marginRightSmall,
      ...commonStyles.flexColumn,
      ...commonStyles.flexEnd,
    },
  });

  return (
    <TouchableOpacity onPress={props.onPress} style={styles.container}>
      <UserAvatarImage userHeader={props.userHeader} small={true} />
    </TouchableOpacity>
  );
};
