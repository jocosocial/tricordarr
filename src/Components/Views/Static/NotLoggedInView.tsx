import React from 'react';
import {Linking, View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppView} from '#src/Components/Views/AppView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {appUrl} from '#src/Libraries/UrlParser';

export const NotLoggedInView = () => {
  const {commonStyles} = useStyles();
  const onPress = () => Linking.openURL(appUrl('login'));
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
            <PrimaryActionButton testID={'login-button'} buttonText={'Login'} onPress={onPress} />
          </View>
        </View>
      </View>
    </AppView>
  );
};
