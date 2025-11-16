import {forwardRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {List} from 'react-native-paper';
import {type Props as RNPListItemProps} from 'react-native-paper/lib/typescript/components/List/ListItem';

import {useStyles} from '#src/Context/Contexts/StyleContext';

/**
 * Generic wrapper for List.Item that applies common styles.
 * They can all be overridden as necessary.
 * This should not be used to present information or data to the user. It's intended
 * to be heavily customized. If you need to show the user information or data use
 * a DataFieldListItem instead.
 */
export const ListItem = forwardRef<View, RNPListItemProps>((props, ref) => {
  const {commonStyles} = useStyles();

  /**
   * Warning: if you provide a left you're on your own for styling correctly
   * with the standard padding.
   */
  const styles = StyleSheet.create({
    item: {
      ...commonStyles.paddingRightSmall,
      ...props.style,
    },
    content: {
      ...commonStyles.paddingLeftSmall,
      ...props.contentStyle,
    },
  });

  return <List.Item ref={ref} style={styles.item} contentStyle={styles.content} {...props} />;
});
