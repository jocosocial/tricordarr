import React, {PropsWithChildren} from 'react';
import {StyleSheet, View} from 'react-native';

import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface HelpChapterTitleViewProps extends PropsWithChildren {
  title: string;
  // Useful for views that contain DataFieldListItems that have their own margins.
  noMargin?: boolean;
}

/**
 * Help Chapters are broad chunks of content. This gives a common header for them.
 */
export const HelpChapterTitleView = (props: HelpChapterTitleViewProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    container: props.noMargin ? commonStyles.marginBottomZero : commonStyles.marginBottomSmall,
    // I actually like this less.
    // text: commonStyles.bold,
  });

  return (
    <>
      <View style={styles.container}>
        <ListSubheader>{props.title}</ListSubheader>
      </View>
      {props.children}
    </>
  );
};
