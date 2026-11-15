import {File, Paths} from 'expo-file-system';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton, List, ProgressBar, Text} from 'react-native-paper';

import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {createLogger} from '#src/Libraries/Logger';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {useMicroKaraokeSongQuery} from '#src/Queries/MicroKaraoke/MicroKaraokeQueries';
import {MicroKaraokeCompletedSong} from '#src/Structs/ControllerStructs';

const logger = createLogger('MicroKaraokeSongListItem.tsx');

interface MicroKaraokeSongListItemProps {
  mkSong: MicroKaraokeCompletedSong;
}

const snippetFileForUrl = (url: string) => {
  const urlWithoutQuery = url.split('?')[0];
  const fileName = urlWithoutQuery.split('/').pop();
  if (!fileName) {
    throw Error(`Unable to determine fileName from url: ${url}`);
  }
  return new File(Paths.document, fileName);
};

const downloadFile = async (url: string) => {
  const destinationFile = snippetFileForUrl(url);

  if (destinationFile.exists) {
    logger.debug(`File ${destinationFile.uri} already exists`);
    return destinationFile.uri;
  }

  await File.downloadFileAsync(url, destinationFile);
  logger.debug(`Successfully saved ${url} to ${destinationFile.uri}`);
  return destinationFile.uri;
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
      logger.debug(`There are ${data.snippetVideoURLs.length} snippets available`);
      setAvailableSnippets(data.snippetVideoURLs.length);
      for (const snippetVideoURL of data.snippetVideoURLs) {
        try {
          await downloadFile(snippetVideoURL);
          setDownloadedSnippets(prev => prev + 1);
        } catch (error) {
          logger.error(`Error with url ${snippetVideoURL}`, error);
        }
      }
    }
    setDownloading(false);
  };

  const onClear = async () => {
    if (data) {
      const results = data.snippetVideoURLs.map(async snippetVideoURL => {
        try {
          const snippetFile = snippetFileForUrl(snippetVideoURL);
          logger.debug(`Clearing ${snippetFile.name}`);
          if (snippetFile.exists) {
            snippetFile.delete();
          }
        } catch (error) {
          logger.error('Error clearing file:', error);
        }
      });
      await Promise.all(results);
    }
  };

  const getDownloadButton = () => (
    <IconButton disabled={downloading} loading={downloading} icon={AppIcons.download} onPress={onDownload} />
  );
  const getClearButton = () => <IconButton icon={AppIcons.delete} onPress={onClear} />;
  logger.debug('Downloaded', downloadedSnippets, 'Available', availableSnippets);

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
