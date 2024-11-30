import {List, Text} from 'react-native-paper';
import React from 'react';
import {MicroKaraokeCompletedSong} from '../../../libraries/Structs/ControllerStructs.tsx';
import {View, StyleSheet} from 'react-native';
import {RelativeTimeTag} from '../../Text/Tags/RelativeTimeTag.tsx';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

interface MicroKaraokeSongListItemProps {
  mkSong: MicroKaraokeCompletedSong;
}

export const MicroKaraokeSongListItem = ({mkSong}: MicroKaraokeSongListItemProps) => {
  const {commonStyles} = useStyles();
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
  return <List.Item title={mkSong.songName} titleStyle={styles.title} description={getDescription} />;
};
