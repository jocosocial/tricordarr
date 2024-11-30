import {List, Text} from 'react-native-paper';
import React from 'react';
import {MicroKaraokeCompletedSong} from '../../../libraries/Structs/ControllerStructs.tsx';
import {View, StyleSheet} from 'react-native';
import {RelativeTimeTag} from '../../Text/Tags/RelativeTimeTag.tsx';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {useMainStack} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {MainStackComponents} from '../../../libraries/Enums/Navigation.ts';

interface MicroKaraokeSongListItemProps {
  mkSong: MicroKaraokeCompletedSong;
}

export const MicroKaraokeSongListItem = ({mkSong}: MicroKaraokeSongListItemProps) => {
  const {commonStyles} = useStyles();
  const mainStack = useMainStack();

  const styles = StyleSheet.create({
    title: commonStyles.bold,
  });

  const getDescription = () => {
    return (
      <View>
        <Text>by {mkSong.artistName}</Text>
        {mkSong.completionTime && (
          <Text>
            Completed <RelativeTimeTag date={new Date(mkSong.completionTime)} />
          </Text>
        )}
      </View>
    );
  };

  const onPress = () =>
    mainStack.push(MainStackComponents.microKaraokeSongScreen, {
      songID: mkSong.songID,
    });

  return <List.Item title={mkSong.songName} titleStyle={styles.title} description={getDescription} onPress={onPress} />;
};
