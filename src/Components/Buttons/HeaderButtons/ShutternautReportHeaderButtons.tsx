import React, {useCallback} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {useDownloadSheet} from '#src/Context/Contexts/DownloadSheetContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useEventPhotographerReportDownloadMutation} from '#src/Queries/Events/EventPhotographerMutations';

interface ShutternautReportHeaderButtonsProps {
  /** The day currently shown on screen, so the CSV matches it. 0 means all days. */
  selectedCruiseDay: number;
}

/**
 * Basename matching Swiftarr's Content-Disposition for the report download.
 */
const REPORT_CSV_BASENAME = 'shutternaut_schedule_report';

/**
 * Photographer coverage report header actions. Help is rightmost; Download sits to its left.
 * There is no reload button: the list's pull-to-refresh covers that.
 */
export const ShutternautReportHeaderButtons = ({selectedCruiseDay}: ShutternautReportHeaderButtonsProps) => {
  const navigation = useCommonStack();
  const {openDownloadSheet} = useDownloadSheet();
  const {snackbarTry} = useSnackbar();
  const {commonStyles} = useStyles();
  const {mutate, isPending} = useEventPhotographerReportDownloadMutation();

  /**
   * Fetches the CSV for the day currently on screen, then presents the download sheet.
   */
  const handleDownload = useCallback(() => {
    mutate(selectedCruiseDay === 0 ? undefined : selectedCruiseDay, {
      onSuccess: csv => {
        openDownloadSheet({
          title: 'Download CSV',
          baseName: REPORT_CSV_BASENAME,
          mimeType: 'text/csv',
          contents: csv,
        });
      },
    });
  }, [mutate, openDownloadSheet, selectedCruiseDay]);

  const onHelp = useCallback(() => {
    navigation.push(CommonStackComponents.shutternautHelpScreen);
  }, [navigation]);

  return (
    <View>
      <MaterialHeaderButtons>
        <Item
          title={'Download'}
          iconName={AppIcons.download}
          onPress={snackbarTry(handleDownload)}
          disabled={isPending}
          style={isPending ? commonStyles.disabled : undefined}
          testID={'headerReportDownload-headerButton'}
        />
        <Item title={'Help'} iconName={AppIcons.help} onPress={onHelp} testID={'headerHelp-headerButton'} />
      </MaterialHeaderButtons>
    </View>
  );
};
