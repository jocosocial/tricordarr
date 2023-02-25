import {SafeAreaView, ScrollView, View} from 'react-native';
import React, {useEffect} from 'react';
import {useTheme} from 'react-native-paper';
import {SaveButton} from '../../Buttons/SaveButton';
import {cancelTestNotification, displayTestNotification} from '../../../notifications/TestNotification';

export const TestNotificationScreen = ({route, navigation}) => {
  const theme = useTheme();

  useEffect(() => {
    navigation.setOptions({title: 'Test Notification'});
  }, [navigation]);

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{backgroundColor: theme.colors.background}}>
          <SaveButton
            buttonText="Display Notification"
            buttonColor={theme.colors.twitarrNeutralButton}
            onPress={() => displayTestNotification()}
          />
          <SaveButton
            buttonText="Cancel"
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() => cancelTestNotification()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
