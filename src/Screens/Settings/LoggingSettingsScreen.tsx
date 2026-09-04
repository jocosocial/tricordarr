import React, {useCallback, useEffect, useState} from 'react';
import {SegmentedButtons} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useDownloadSheet} from '#src/Context/Contexts/DownloadSheetContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertClearLogs} from '#src/Libraries/Alerts/SettingsAlerts';
import {clearAllLogs, flushLogs, getCurrentLogFile, getLogFileInfo, setLogLevel} from '#src/Libraries/Logger';
import {LogLevel} from '#src/Libraries/Logger/types';

const getExportFileName = () => `tricordarr-${Math.floor(Date.now() / 1000)}`;

export const LoggingSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {setSnackbarPayload} = useSnackbar();
  const {openDownloadSheet} = useDownloadSheet();
  const [logFileInfo, setLogFileInfo] = useState<{path: string; size: string; lastModified: string} | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const {theme} = useAppTheme();

  const refreshLogFileInfo = useCallback(async () => {
    const info = await getLogFileInfo();
    setLogFileInfo(info);
  }, []);

  const {refreshing, onRefresh} = useRefresh({refresh: refreshLogFileInfo});

  useEffect(() => {
    refreshLogFileInfo();
  }, [refreshLogFileInfo]);

  const handleLogLevelChange = (value: string) => {
    const newLevel = value as LogLevel;
    setLogLevel(newLevel);
    updateAppConfig({
      ...appConfig,
      logLevel: newLevel,
    });
  };

  /**
   * Flushes the log buffer and opens the download sheet for the current log file.
   */
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await flushLogs();

      const logFile = getCurrentLogFile();
      if (!logFile.exists) {
        setSnackbarPayload({message: 'No log files found to export.', messageType: 'info'});
        return;
      }

      const info = logFile.info();
      if (!info.size) {
        setSnackbarPayload({message: 'Log file is empty.', messageType: 'info'});
        return;
      }

      openDownloadSheet({
        title: 'Download Logs',
        baseName: getExportFileName(),
        mimeType: 'text/plain',
        contents: await logFile.text(),
      });
    } catch (error) {
      setSnackbarPayload({
        message: `Could not prepare log file: ${error}`,
        messageType: 'error',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClear = () => {
    alertClearLogs(async () => {
      try {
        setIsClearing(true);
        await clearAllLogs();
        await refreshLogFileInfo();
        setSnackbarPayload({message: 'All log files have been deleted.', messageType: 'success'});
      } catch {
        setSnackbarPayload({
          message: 'Could not delete log files. Please try again.',
          messageType: 'error',
        });
      } finally {
        setIsClearing(false);
      }
    });
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <ListSubheader>Log Level</ListSubheader>
          <PaddedContentView padTop={true}>
            <SegmentedButtons
              value={appConfig.logLevel}
              onValueChange={handleLogLevelChange}
              buttons={[
                {
                  value: LogLevel.DEBUG,
                  label: 'Debug',
                },
                {
                  value: LogLevel.INFO,
                  label: 'Info',
                },
                {
                  value: LogLevel.WARN,
                  label: 'Warn',
                },
                {
                  value: LogLevel.ERROR,
                  label: 'Error',
                },
              ]}
            />
          </PaddedContentView>
        </ListSection>

        <ListSection>
          <ListSubheader>Log Files</ListSubheader>
          <DataFieldListItem title={'Current Log File'} description={logFileInfo ? logFileInfo.size : 'No logs yet'} />
          {logFileInfo && <DataFieldListItem title={'Last Modified'} description={logFileInfo.lastModified} />}
          <DataFieldListItem title={'Retention'} description={'7 days'} />
        </ListSection>

        <ListSection>
          <ListSubheader>Actions</ListSubheader>
          <PaddedContentView padTop={true}>
            <PrimaryActionButton
              testID={'downloadLogs-button'}
              icon={AppIcons.download}
              buttonText={'Download Logs'}
              onPress={handleDownload}
              disabled={!logFileInfo || isDownloading}
              isLoading={isDownloading}
            />
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton
              testID={'clearAllLogs-button'}
              icon={AppIcons.delete}
              buttonText={'Clear All Logs'}
              onPress={handleClear}
              disabled={!logFileInfo || isClearing || isDownloading}
              isLoading={isClearing}
              buttonColor={theme.colors.twitarrNegativeButton}
            />
          </PaddedContentView>
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
