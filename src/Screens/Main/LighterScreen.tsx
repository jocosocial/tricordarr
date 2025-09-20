import {useNavigation} from '@react-navigation/native';
import React from 'react';
import VideoPlayer from 'react-native-video-controls';

import LighterVideo from '#assets/RockBalladMode.mp4';
import {AppView} from '#src/Components/Views/AppView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
// @ts-ignore

export const LighterScreen = () => {
  const {commonStyles} = useStyles();
  const navigation = useNavigation();

  return (
    <AppView>
      <VideoPlayer
        source={LighterVideo}
        style={commonStyles.backgroundVideo}
        repeat={true}
        disableTimer={true}
        disableVolume={true}
        disableSeekbar={true}
        disablePlayPause={true}
        disableFullscreen={true}
        onBack={() => navigation.goBack()}
        // https://stackoverflow.com/questions/55076018/problem-why-react-native-video-does-not-play-video-in-full-screen
        resizeMode={'cover'}
      />
    </AppView>
  );
};
