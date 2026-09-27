import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {Divider, Searchbar} from 'react-native-paper';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {NotificationLogListItem} from '#src/Components/Lists/Items/NotificationLogListItem';
import {NotificationLogActionsMenu} from '#src/Components/Menus/Settings/NotificationLogActionsMenu';
import {
  NotificationLogFilterMenu,
  NotificationLogTimeFilter,
} from '#src/Components/Menus/Settings/NotificationLogFilterMenu';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useDownloadSheet} from '#src/Context/Contexts/DownloadSheetContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertClearNotificationLog} from '#src/Libraries/Alerts/SettingsAlerts';
import {
  clearNotificationLog,
  getNotificationLogEntries,
  subscribeToNotificationLog,
} from '#src/Libraries/NotificationLog';
import {NotificationLogEntry} from '#src/Libraries/NotificationLog/types';
import {getNotificationTypeTitle} from '#src/Libraries/Notifications/NotificationEventTitles';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

const TIME_FILTER_MS: Record<Exclude<NotificationLogTimeFilter, 'all'>, number> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
};

const getExportBaseName = () => `tricordarr-notifications-filtered-${Math.floor(Date.now() / 1000)}`;

interface NotificationLogSearchHeaderProps {
  onSearch: (query: string) => void;
}

/**
 * Owns its own input state so typing never re-renders NotificationLogScreen (and, in turn,
 * never changes the identity of the FlashList header component — which would remount the
 * input and drop characters on every keystroke). Only reports the query up to the parent on
 * submit. Mirrors LogSearchHeader in LogViewerScreen.tsx.
 */
const NotificationLogSearchHeader = ({onSearch}: NotificationLogSearchHeaderProps) => {
  const [text, setText] = useState('');

  const handleSubmit = () => onSearch(text.trim());
  const handleClear = () => {
    setText('');
    onSearch('');
  };

  return (
    <PaddedContentView padTop={true}>
      <Searchbar
        testID={'notificationLog-search'}
        placeholder={'Search notification log'}
        value={text}
        onChangeText={setText}
        onIconPress={handleSubmit}
        onSubmitEditing={handleSubmit}
        onClearIconPress={handleClear}
      />
    </PaddedContentView>
  );
};

/**
 * Displays the persistent notification log: every event received on the notification socket,
 * regardless of whether it produced a push notification. See src/Libraries/NotificationLog
 * for how entries are recorded on each platform.
 */
export const NotificationLogScreen = () => {
  const navigation = useCommonStack();
  const flashListRef = useRef<FlashListRef<NotificationLogEntry>>(null);
  const {openDownloadSheet} = useDownloadSheet();
  const {setSnackbarPayload} = useSnackbar();
  const [entries, setEntries] = useState<NotificationLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [timeFilter, setTimeFilter] = useState<NotificationLogTimeFilter>('all');
  const [isClearing, setIsClearing] = useState(false);

  const refresh = useCallback(async () => {
    setEntries(await getNotificationLogEntries());
  }, []);

  const {refreshing, onRefresh} = useRefresh({refresh});

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    return subscribeToNotificationLog(() => {
      refresh();
    });
  }, [refresh]);

  const typeOptions = useMemo(() => {
    const types = new Set(entries.map(entry => entry.type));
    return Array.from(types)
      .map(type => ({value: type, label: getNotificationTypeTitle(type)}))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const cutoff = timeFilter === 'all' ? undefined : Date.now() - TIME_FILTER_MS[timeFilter];

    return entries.filter(entry => {
      if (typeFilter !== undefined && entry.type !== typeFilter) {
        return false;
      }
      if (cutoff !== undefined && entry.timestamp.getTime() < cutoff) {
        return false;
      }
      if (
        query &&
        !entry.info.toLowerCase().includes(query) &&
        !entry.type.toLowerCase().includes(query) &&
        !entry.contentID.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [entries, searchQuery, typeFilter, timeFilter]);

  const handleSaveFiltered = useCallback(() => {
    if (filteredEntries.length === 0) {
      setSnackbarPayload({message: 'No notification log entries to save.', messageType: 'info'});
      return;
    }
    openDownloadSheet({
      title: 'Save Visible Notification Events',
      baseName: getExportBaseName(),
      mimeType: 'text/plain',
      contents: filteredEntries.map(entry => entry.raw).join('\n'),
    });
  }, [filteredEntries, openDownloadSheet, setSnackbarPayload]);

  const handleClear = useCallback(() => {
    alertClearNotificationLog(async () => {
      try {
        setIsClearing(true);
        await clearNotificationLog();
        await refresh();
        setSnackbarPayload({message: 'Notification log cleared.', messageType: 'success'});
      } catch {
        setSnackbarPayload({message: 'Could not clear the notification log. Please try again.', messageType: 'error'});
      } finally {
        setIsClearing(false);
      }
    });
  }, [refresh, setSnackbarPayload]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <NotificationLogFilterMenu
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            typeOptions={typeOptions}
          />
          <NotificationLogActionsMenu
            onSave={handleSaveFiltered}
            onClear={handleClear}
            isClearing={isClearing}
            onHelp={() => navigation.push(CommonStackComponents.notificationLogHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [handleSaveFiltered, handleClear, isClearing, typeFilter, timeFilter, typeOptions, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const listHeader = useCallback(() => <NotificationLogSearchHeader onSearch={handleSearch} />, [handleSearch]);

  const renderItem = ({item}: {item: NotificationLogEntry}) => <NotificationLogListItem entry={item} />;
  const itemSeparator = () => <Divider bold={true} />;

  return (
    <AppView>
      <AppFlashList<NotificationLogEntry>
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
