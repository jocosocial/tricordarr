import {Directory, File, Paths} from 'expo-file-system';
import {StorageAccessFramework} from 'expo-file-system/legacy';
import React, {useCallback, useEffect, useState} from 'react';
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
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertClearLogs} from '#src/Libraries/Alerts/SettingsAlerts';
import {clearAllLogs, flushLogs, getCurrentLogFile, getLogFileInfo, setLogLevel} from '#src/Libraries/Logger';
import {LogLevel} from '#src/Libraries/Logger/types';
import {isAndroid} from '#src/Libraries/Platform/Detection';

const isPickerCancelled = (error: unknown) => error instanceof Error && /cancell?ed/i.test(error.message);

const getExportFileName = () => `tricordarr-${Math.floor(Date.now() / 1000)}`;

export const LoggingSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {setSnackbarPayload} = useSnackbar();
  const [logFileInfo, setLogFileInfo] = useState<{path: string; size: string; lastModified: string} | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const prepareLogFile = async (): Promise<File | null> => {
    await flushLogs();

    const logFile = getCurrentLogFile();
    if (!logFile.exists) {
      setSnackbarPayload({message: 'No log files found to export.', messageType: 'info'});
      return null;
    }

    const info = logFile.info();
    if (!info.size) {
      setSnackbarPayload({message: 'Log file is empty.', messageType: 'info'});
      return null;
    }

    return logFile;
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const logFile = await prepareLogFile();
      if (!logFile) {
        return;
      }

      const downloadFileName = `${getExportFileName()}.txt`;

      // Copy into cache so Android FileProvider (react-native-share) can serve the file.
      // Documents-directory URIs are not in that provider's paths and NPEs on getScheme().
      const shareFile = new File(Paths.cache, downloadFileName);
      await logFile.copy(shareFile, {overwrite: true});

      const shareResult = await Share.open({
        url: shareFile.uri,
        type: 'text/plain',
        filename: downloadFileName,
        failOnCancel: false,
      });

      if (shareResult.success && !shareResult.dismissedAction) {
        setSnackbarPayload({
          message: 'Log file shared successfully',
          messageType: 'success',
        });
      }
    } catch (error) {
      if (isPickerCancelled(error) || (error instanceof Error && /did not share/i.test(error.message))) {
        return;
      }
      setSnackbarPayload({
        message: `Could not export log file: ${error}`,
        messageType: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToFolder = async () => {
    try {
      setIsSaving(true);
      const logFile = await prepareLogFile();
      if (!logFile) {
        return;
      }

      const contents = await logFile.text();
      const fileName = getExportFileName();

      // Directory.createFile NPEs on Android SAF URIs from pickDirectoryAsync.
      // The legacy Storage Access Framework APIs are reliable here.
      if (isAndroid) {
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          return;
        }
        const destUri = await StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'text/plain');
        await StorageAccessFramework.writeAsStringAsync(destUri, contents);
      } else {
        const directory = await Directory.pickDirectoryAsync();
        const destFile = directory.createFile(fileName, 'text/plain');
        destFile.write(contents);
      }
      setSnackbarPayload({message: 'Log file saved.', messageType: 'success'});
    } catch (error) {
      if (isPickerCancelled(error)) {
        return;
      }
      setSnackbarPayload({
        message: `Could not save log file: ${error}`,
        messageType: 'error',
      });
    } finally {
      setIsSaving(false);
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
              icon={AppIcons.share}
              buttonText={'Share Logs'}
              onPress={handleExport}
              disabled={!logFileInfo || isExporting || isSaving}
              isLoading={isExporting}
            />
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton
              icon={AppIcons.download}
              buttonText={'Save to Folder'}
              onPress={handleSaveToFolder}
              disabled={!logFileInfo || isExporting || isSaving}
              isLoading={isSaving}
            />
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton
              icon={AppIcons.delete}
              buttonText={'Clear All Logs'}
              onPress={handleClear}
              disabled={!logFileInfo || isClearing || isExporting || isSaving}
              isLoading={isClearing}
              buttonColor={theme.colors.twitarrNegativeButton}
            />
          </PaddedContentView>
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
