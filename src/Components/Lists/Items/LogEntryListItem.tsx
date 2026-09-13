import React from 'react';
import {StyleSheet} from 'react-native';
import {List} from 'react-native-paper';

import {useDownloadSheet} from '#src/Context/Contexts/DownloadSheetContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {LogEntry, LogLevel} from '#src/Libraries/Logger/types';

interface LogEntryListItemProps {
  entry: LogEntry;
}

const getLevelColor = (level: LogLevel, theme: ReturnType<typeof useAppTheme>['theme']) => {
  switch (level) {
    case LogLevel.ERROR:
      return theme.colors.twitarrNegativeButton;
    case LogLevel.WARN:
      return theme.colors.twitarrYellow;
    default:
      return undefined;
  }
};

export const LogEntryListItem = ({entry}: LogEntryListItemProps) => {
  const {theme} = useAppTheme();
  const {commonStyles} = useStyles();
  const {openDownloadSheet} = useDownloadSheet();

  const handleLongPress = () => {
    openDownloadSheet({
      title: 'Share Log Entry',
      mimeType: 'text/plain',
      contents: entry.raw,
      mode: 'text',
    });
  };

  const levelColor = getLevelColor(entry.level, theme);
  const styles = StyleSheet.create({
    title: {
      ...commonStyles.fontSizeLabel,
      ...commonStyles.onBackground,
      ...(levelColor ? {color: levelColor} : {}),
    },
    description: {
      ...commonStyles.fontSizeDefault,
      ...commonStyles.onBackground,
    },
    item: {
      ...commonStyles.paddingHorizontalSmall,
      ...commonStyles.paddingVerticalZero,
    },
    content: {
      ...commonStyles.paddingLeftZero,
      ...commonStyles.paddingRightZero,
    },
  });

  return (
    <List.Item
      title={`${entry.timestamp.toLocaleString()} · ${entry.level.toUpperCase()} · ${entry.tag}`}
      titleNumberOfLines={0}
      description={entry.message}
      descriptionNumberOfLines={0}
      titleStyle={styles.title}
      descriptionStyle={styles.description}
      style={styles.item}
      contentStyle={styles.content}
      onLongPress={handleLongPress}
    />
  );
};
