import React from 'react';
import {Linking, View} from 'react-native';
import {Text} from 'react-native-paper';
import {AppView} from '../AppView';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {AppIcon} from '../../Icons/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';

export const ErrorView = () => {
  const {commonStyles} = useStyles();
  const styles = {
    outerContainer: [commonStyles.flex, commonStyles.justifyCenter, commonStyles.alignItemsCenter],
    innerContainer: [commonStyles.justifyCenter, commonStyles.alignItemsCenter],
    contentContainer: [commonStyles.marginVerticalSmall],
  };
  return (
    <AppView>
      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.contentContainer}>
            <AppIcon icon={AppIcons.error} size={150} />
          </View>
          <View>
            <Text>Something went wrong.</Text>
          </View>
        </View>
      </View>
    </AppView>
  );
};
