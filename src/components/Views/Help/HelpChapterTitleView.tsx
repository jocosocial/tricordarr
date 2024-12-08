import {ListSubheader} from '../../Lists/ListSubheader.tsx';
import React from 'react';
import {View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

interface HelpChapterTitleView {
  title: string;
}

/**
 * Help Chapters are broad chunks of content. This gives a common header for them.
 */
export const HelpChapterTitleView = (props: HelpChapterTitleView) => {
  const {commonStyles} = useStyles();
  return (
    <View style={commonStyles.marginBottom}>
      <ListSubheader>{props.title}</ListSubheader>
    </View>
  );
};
