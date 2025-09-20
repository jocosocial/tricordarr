import React from 'react';
import {StyleSheet, View} from 'react-native';

import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface HelpChapterTitleView {
  title: string;
}

/**
 * Help Chapters are broad chunks of content. This gives a common header for them.
 */
export const HelpChapterTitleView = (props: HelpChapterTitleView) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    container: commonStyles.marginBottom,
    // I actually like this less.
    // text: commonStyles.bold,
  });

  return (
    <View style={styles.container}>
      <ListSubheader>{props.title}</ListSubheader>
    </View>
  );
};
