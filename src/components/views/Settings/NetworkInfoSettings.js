import {SafeAreaView, ScrollView, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Text, useTheme} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';

export const NetworkInfoSettings = ({route, navigation}) => {
  const theme = useTheme();
  const [data, setData] = useState({});

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  useEffect(() => {
    async function fetchData() {
      const netData = await NetInfo.fetch();
      // const foo = ;
      // console.log(foo);
      console.log(netData);
      setData(netData);
    }
    fetchData().catch(e => console.error);
  });

  // @TODO details is an object that needs decoded.
  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{backgroundColor: theme.colors.background}}>
          {Object.keys(data).map(key => (
            <Text>{key} :: {data[key].toString()}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
