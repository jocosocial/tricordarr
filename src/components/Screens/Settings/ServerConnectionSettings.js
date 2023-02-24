import React, {useEffect, useState, useCallback} from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {useTheme} from 'react-native-paper';
import {startForegroundServiceWorker, stopForegroundServiceWorker} from '../../../libraries/Service';
import {SaveButton} from '../../Buttons/SaveButton';

export const ServerConnectionSettings = ({route, navigation}) => {
  const theme = useTheme();

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{backgroundColor: theme.colors.background}}>
          <SaveButton
            buttonText={'Start'}
            buttonColor={theme.colors.twitarrPositiveButton}
            onPress={() => startForegroundServiceWorker().catch(console.error)}
          />
          <SaveButton
            buttonText={'Stop'}
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() => stopForegroundServiceWorker().catch(console.error)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
