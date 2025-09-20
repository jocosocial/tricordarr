import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import RNFS from 'react-native-fs';
import {IconButton, List, ProgressBar, Text} from 'react-native-paper';

import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/MainStackNavigator';
import {useMicroKaraokeSongQuery} from '#src/Queries/MicroKaraoke/MicroKaraokeQueries';
import {MicroKaraokeCompletedSong} from '#src/Structs/ControllerStructs';

interface MicroKaraokeSongListItemProps {
  mkSong: MicroKaraokeCompletedSong;
}

const downloadFile = async (url: string) => {
  const fileName = url.split('/').pop();
  if (!fileName) {
    throw Error(`Unable to determine fileName from url: ${url}`);
  }
  const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

  const exists = await RNFS.exists(destinationPath);
  if (exists) {
    console.log(`File ${destinationPath} already exists`);
    return destinationPath;
  }

  const result = await RNFS.downloadFile({
    fromUrl: url,
    toFile: destinationPath,
  }).promise;
  console.log('Got status', result.statusCode);

  if (result.statusCode === 200) {
    console.log(`Successfully saved ${url} to ${destinationPath}`);
  }
  return destinationPath;
};

export const MicroKaraokeSongListItem = ({mkSong}: MicroKaraokeSongListItemProps) => {
  const {commonStyles} = useStyles();
  const mainStack = useMainStack();
  const {data, refetch} = useMicroKaraokeSongQuery(mkSong.songID, false);
  const [downloadedSnippets, setDownloadedSnippets] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [availableSnippets, setAvailableSnippets] = useState(0);

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

  const onDownload = async () => {
    setDownloading(true);
    setDownloadedSnippets(0);
    await refetch();
    if (data) {
      console.log(`There are ${data.snippetVideoURLs.length} snippets available`);
      setAvailableSnippets(data.snippetVideoURLs.length);
      for (const snippetVideoURL of data.snippetVideoURLs) {
        try {
          await downloadFile(snippetVideoURL);
          setDownloadedSnippets(prev => prev + 1);
        } catch (error) {
          console.error(`Error with url ${snippetVideoURL}`);
          console.error(error);
        }
      }
    }
    setDownloading(false);
  };

  const onClear = async () => {
    if (data) {
      const results = data.snippetVideoURLs.map(async snippetVideoURL => {
        const fileName = snippetVideoURL.split('/').pop();
        if (!fileName) {
          return;
        }
        console.log(`Clearing ${fileName}`);
        try {
          await RNFS.unlink(`${RNFS.DocumentDirectoryPath}/${fileName}`);
        } catch (error) {
          console.error(error);
        }
      });
      await Promise.all(results);
    }
  };

  const getDownloadButton = () => (
    <IconButton disabled={downloading} loading={downloading} icon={AppIcons.download} onPress={onDownload} />
  );
  const getClearButton = () => <IconButton icon={AppIcons.delete} onPress={onClear} />;
  console.log('Downloaded', downloadedSnippets, 'Available', availableSnippets);

  return (
    <View>
      <List.Item
        title={mkSong.songName}
        titleStyle={styles.title}
        description={getDescription}
        onPress={onPress}
        right={getDownloadButton}
        left={getClearButton}
      />
      {downloading && availableSnippets !== 0 && <ProgressBar progress={downloadedSnippets / availableSnippets} />}
    </View>
  );
};
