import React, {PropsWithChildren} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {IconButton, Text} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface HelpTopicViewProps extends PropsWithChildren {
  title?: string;
  icon?: IconSource;
  right?: React.JSX.Element;
  style?: StyleProp<ViewStyle>;
}

/**
 * Help topics are sections of Help content with a bold title and maybe an icon.
 * The help content is then provided as a child to this element.
 */
export const HelpTopicView = (props: HelpTopicViewProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    titleContainer: {
      ...commonStyles.marginBottomSmall,
    },
    title: {
      ...commonStyles.bold,
    },
    bodyContainer: {
      ...commonStyles.flexRow,
    },
    bodyTextContainer: {
      ...commonStyles.flex,
    },
  });

  return (
    <PaddedContentView style={props.style}>
      {props.title && (
        <View style={styles.titleContainer}>
          <Text style={styles.title} selectable={true}>
            {props.title}
          </Text>
        </View>
      )}
      <View style={styles.bodyContainer}>
        {props.right
          ? props.right
          : props.icon && (
          <View>
                <IconButton icon={props.icon} />
              </View>
            )}
        <View style={styles.bodyTextContainer}>
          <Text selectable={true}>{props.children}</Text>
        </View>
      </View>
    </PaddedContentView>
  );
};
