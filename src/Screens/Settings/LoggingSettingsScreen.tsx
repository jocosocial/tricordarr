import React, {useCallback, useEffect, useState} from 'react';
import {Alert} from 'react-native';
import RNFS from 'react-native-fs';
import {SegmentedButtons} from 'react-native-paper';
import Share from 'react-native-share';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useRefresh} from '#src/Hooks/useRefresh';
import {clearAllLogs, flushLogs, getCurrentLogFile, getLogFileInfo, setLogLevel} from '#src/Libraries/Logger';
import {LogLevel} from '#src/Libraries/Logger/types';
import {isAndroid} from '#src/Libraries/Platform/Detection';

export const LoggingSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {setSnackbarPayload} = useSnackbar();
  const [logFileInfo, setLogFileInfo] = useState<{path: string; size: string; lastModified: string} | null>(null);
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExport = async () => {
    try {
      setIsExporting(true);
      // Flush any buffered logs first
      await flushLogs();

      const logFilePath = getCurrentLogFile();

      // Check if file exists
      const exists = await RNFS.exists(logFilePath);
      if (!exists) {
        setSnackbarPayload({message: 'No log files found to export.', messageType: 'info'});
        return;
      }

      // Get file stats to check if empty
      const stat = await RNFS.stat(logFilePath);
      if (stat.size === 0) {
        setSnackbarPayload({message: 'Log file is empty.', messageType: 'info'});
        return;
      }

      // Create filename with epoch timestamp
      const epochTime = Math.floor(Date.now() / 1000);
      const downloadFileName = `tricordarr-${epochTime}.txt`;

      if (isAndroid) {
        // Android: Copy directly to Downloads folder
        // Check if DownloadDirectoryPath exists
        if (!RNFS.DownloadDirectoryPath) {
          // Fallback to ExternalStorageDirectoryPath/Download
          const downloadPath = `${RNFS.ExternalStorageDirectoryPath}/Download/${downloadFileName}`;
          await RNFS.copyFile(logFilePath, downloadPath);
        } else {
          const downloadPath = `${RNFS.DownloadDirectoryPath}/${downloadFileName}`;
          await RNFS.copyFile(logFilePath, downloadPath);
        }

        setSnackbarPayload({
          message: `Log file saved to Downloads as ${downloadFileName}`,
          messageType: 'success',
        });
      } else {
        // iOS: Use share sheet
        const shareResult = await Share.open({
          url: `file://${logFilePath}`,
          type: 'text/plain',
          filename: downloadFileName,
          failOnCancel: false,
        });

        // Only show success message if user actually shared (not cancelled)
        if (shareResult.success || shareResult.message) {
          setSnackbarPayload({
            message: 'Log file shared successfully',
            messageType: 'success',
          });
        }
      }
    } catch (error) {
      setSnackbarPayload({
        message: `Could not export log file: ${error}`,
        messageType: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClear = () => {
    Alert.alert('Clear All Logs', 'Are you sure you want to delete all log files? This cannot be undone.', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsClearing(true);
            await clearAllLogs();
            await refreshLogFileInfo();
            setSnackbarPayload({message: 'All log files have been deleted.', messageType: 'success'});
          } catch (error) {
            setSnackbarPayload({
              message: 'Could not delete log files. Please try again.',
              messageType: 'error',
            });
          } finally {
            setIsClearing(false);
          }
        },
      },
    ]);
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
              buttonText={'Export Logs'}
              onPress={handleExport}
              disabled={!logFileInfo || isExporting}
              isLoading={isExporting}
            />
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton
              buttonText={'Clear All Logs'}
              onPress={handleClear}
              disabled={!logFileInfo || isClearing}
              isLoading={isClearing}
              buttonColor={theme.colors.twitarrNegativeButton}
            />
          </PaddedContentView>
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
