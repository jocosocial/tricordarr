import React, {useEffect, useState, useCallback} from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import {SaveButton} from "../../Buttons/SaveButton";

export const AccountSettings = ({route, navigation}) => {
  const theme = useTheme();
  // const [data, setData] = useState({});
  const {isLoading, error, data} = useQuery({
    queryKey: ['/user/profile'],
  });
  console.log(isLoading);

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  function logout() {
    console.log('Logout');
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{backgroundColor: theme.colors.background}}>
          <Text>{JSON.stringify(data)}</Text>
          <SaveButton buttonColor={theme.colors.twitarrNegativeButton} buttonText={'Logout'} onPress={() => logout()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
