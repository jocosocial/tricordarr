import React, {useEffect, useState, useCallback} from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';

export const AccountSettings = ({route, navigation}) => {
  const theme = useTheme();
  // const [data, setData] = useState({});

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{backgroundColor: theme.colors.background}}>
          <Text>Sup</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
