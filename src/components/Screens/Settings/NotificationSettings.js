import {SafeAreaView, ScrollView, View} from 'react-native';
import React, {useEffect} from 'react';
import {useTheme} from 'react-native-paper';
import {EnableNotificationForm} from '../../forms/EnableNotificationForm';

export const NotificationSettings = ({route, navigation}) => {
  const theme = useTheme();

  useEffect(() => {
    navigation.setOptions({title: 'Local Notifications.js'});
  }, [navigation]);

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{backgroundColor: theme.colors.background}}>
          <EnableNotificationForm />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
