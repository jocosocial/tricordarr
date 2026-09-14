import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {Divider, Searchbar} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {LogEntryListItem} from '#src/Components/Lists/Items/LogEntryListItem';
import {
  LogViewerFilterMenu,
  LogViewerLevelFilter,
  LogViewerTimeFilter,
} from '#src/Components/Menus/Settings/LogViewerFilterMenu';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useDownloadSheet} from '#src/Context/Contexts/DownloadSheetContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {getLogEntries} from '#src/Libraries/Logger';
import {LogEntry} from '#src/Libraries/Logger/types';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useSettingsStack} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';

const TIME_FILTER_MS: Record<Exclude<LogViewerTimeFilter, 'all'>, number> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
};

const getExportBaseName = () => `tricordarr-logs-filtered-${Math.floor(Date.now() / 1000)}`;

interface LogSearchHeaderProps {
  onSearch: (query: string) => void;
}

/**
 * Owns its own input state so typing never re-renders LogViewerScreen (and, in
 * turn, never changes the identity of the FlashList header component — which
 * previously caused the input to remount and drop characters on every keystroke).
 * Only reports the query up to the parent on submit.
 */
const LogSearchHeader = ({onSearch}: LogSearchHeaderProps) => {
  const [text, setText] = useState('');

  const handleSubmit = () => onSearch(text.trim());
  const handleClear = () => {
    setText('');
    onSearch('');
  };

  return (
    <PaddedContentView padTop={true}>
      <Searchbar
        testID={'logViewer-search'}
        placeholder={'Search logs'}
        value={text}
        onChangeText={setText}
        onIconPress={handleSubmit}
        onSubmitEditing={handleSubmit}
        onClearIconPress={handleClear}
      />
    </PaddedContentView>
  );
};

export const LogViewerScreen = () => {
  const navigation = useSettingsStack();
  const flashListRef = useRef<FlashListRef<LogEntry>>(null);
  const {openDownloadSheet} = useDownloadSheet();
  const {setSnackbarPayload} = useSnackbar();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogViewerLevelFilter>('all');
  const [timeFilter, setTimeFilter] = useState<LogViewerTimeFilter>('all');

  const refresh = useCallback(async () => {
    setEntries(await getLogEntries());
  }, []);

  const {refreshing, onRefresh} = useRefresh({refresh});

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const cutoff = timeFilter === 'all' ? undefined : Date.now() - TIME_FILTER_MS[timeFilter];

    return entries.filter(entry => {
      if (levelFilter !== 'all' && entry.level !== levelFilter) {
        return false;
      }
      if (cutoff !== undefined && entry.timestamp.getTime() < cutoff) {
        return false;
      }
      if (query && !entry.message.toLowerCase().includes(query) && !entry.tag.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [entries, searchQuery, levelFilter, timeFilter]);

  const handleSaveFiltered = useCallback(() => {
    if (filteredEntries.length === 0) {
      setSnackbarPayload({message: 'No log entries to save.', messageType: 'info'});
      return;
    }
    openDownloadSheet({
      title: 'Save Visible Logs',
      baseName: getExportBaseName(),
      mimeType: 'text/plain',
      contents: filteredEntries.map(entry => entry.raw).join('\n'),
    });
  }, [filteredEntries, openDownloadSheet, setSnackbarPayload]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item title={'Save'} iconName={AppIcons.download} onPress={handleSaveFiltered} />
          <LogViewerFilterMenu
            levelFilter={levelFilter}
            setLevelFilter={setLevelFilter}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
          />
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.loggingHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [handleSaveFiltered, levelFilter, timeFilter, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const listHeader = useCallback(() => <LogSearchHeader onSearch={handleSearch} />, [handleSearch]);

  const renderItem = ({item}: {item: LogEntry}) => <LogEntryListItem entry={item} />;
  const itemSeparator = () => <Divider bold={true} />;

  return (
    <AppView>
      <AppFlashList<LogEntry>
        ref={flashListRef}
        renderItem={renderItem}
        data={filteredEntries}
        renderListHeader={listHeader}
        renderItemSeparator={itemSeparator}
        refreshControl={<AppRefreshControl onRefresh={onRefresh} refreshing={refreshing} />}
      />
    </AppView>
  );
};
