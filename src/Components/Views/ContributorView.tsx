import React, {PropsWithChildren} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

interface ContributorViewProps {
  image: AppImageMetaData;
}

export const ContributorView = (props: PropsWithChildren<ContributorViewProps>) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    content: {
      ...commonStyles.flexRow,
      ...commonStyles.marginBottom,
    },
    image: {
      width: 100,
      height: 100,
      ...commonStyles.marginRight,
      ...commonStyles.roundedBorder,
    },
    body: {
      ...commonStyles.flex,
      ...commonStyles.flexColumn,
    },
  });

  return (
    <View style={styles.content}>
      <AppImage image={props.image} style={styles.image} />
      <View style={styles.body}>
        <Text>{props.children}</Text>
      </View>
    </View>
  );
};
