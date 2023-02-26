import {SafeAreaView, ScrollView, View} from 'react-native';
import React, {useEffect} from 'react';
import {useTheme} from 'react-native-paper';
import {EnableNotificationForm} from '../../Forms/EnableNotificationForm';
import {AppView} from "../../Views/AppView";

export const NotificationSettings = ({route, navigation}) => {
  const theme = useTheme();

  useEffect(() => {
    navigation.setOptions({title: 'Local Notifications'});
  }, [navigation]);

  return (
    <AppView>
      <ScrollView>
        <View style={{backgroundColor: theme.colors.background}}>
          <EnableNotificationForm />
        </View>
      </ScrollView>
    </AppView>
  );
};
