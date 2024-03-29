import React from 'react';
import {Linking, View} from 'react-native';
import {Text} from 'react-native-paper';
import {AppView} from '../AppView';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {useStyles} from '../../Context/Contexts/StyleContext';

export const NotLoggedInView = () => {
  const {commonStyles} = useStyles();
  const onPress = () => Linking.openURL('tricordarr://login');
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
            <Text>You are not logged in.</Text>
          </View>
          <View style={styles.contentContainer}>
            <PrimaryActionButton buttonText={'Login'} onPress={onPress} />
          </View>
        </View>
      </View>
    </AppView>
  );
};
