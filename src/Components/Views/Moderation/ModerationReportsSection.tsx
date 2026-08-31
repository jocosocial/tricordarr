import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';

import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ReportModerationData} from '#src/Structs/ControllerStructs';

interface ModerationReportsSectionProps {
  reports: ReportModerationData[];
  contentLabel: string;
  isLoading?: boolean;
  onHandleAll?: () => void;
  onCloseAll?: () => void;
}

/**
 * Lists reports against a piece of content, with Start Handling All / Close All.
 */
export const ModerationReportsSection = ({
  reports,
  contentLabel,
  isLoading,
  onHandleAll,
  onCloseAll,
}: ModerationReportsSectionProps) => {
  const {commonStyles} = useStyles();
  const navigation = useCommonStack();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          ...commonStyles.flexRow,
          ...commonStyles.flexWrap,
          ...commonStyles.gapSmall,
        },
        reportHeader: {
          ...commonStyles.flexRow,
          ...commonStyles.justifySpaceBetween,
        },
        message: {
          ...commonStyles.marginTopSmall,
        },
      }),
    [commonStyles],
  );

  if (reports.length === 0) {
    return (
      <PaddedContentView padTop={true}>
        <Text variant={'titleMedium'}>No reports on this {contentLabel}.</Text>
      </PaddedContentView>
    );
  }

  const firstOpen = reports.find(report => !report.isClosed);

  return (
    <>
      <ListSection>
        <ListSubheader>
          {reports.length} report{reports.length === 1 ? '' : 's'} on this {contentLabel}
        </ListSubheader>
      </ListSection>
      {(onHandleAll || onCloseAll) && firstOpen && (
        <PaddedContentView>
          <View style={styles.row}>
            {onHandleAll && (
              <Button mode={'contained'} compact={true} disabled={isLoading} onPress={onHandleAll}>
                Start Handling All
              </Button>
            )}
            {onCloseAll && (
              <Button mode={'contained'} compact={true} disabled={isLoading} onPress={onCloseAll}>
                Close All
              </Button>
            )}
          </View>
        </PaddedContentView>
      )}
      {reports.map(report => {
        let statusLabel = report.isClosed ? 'Closed' : 'Open';
        if (report.handledBy) {
          statusLabel = report.isClosed
            ? `Closed by @${report.handledBy.username}`
            : `Being handled by @${report.handledBy.username}`;
        }
        return (
          <PaddedContentView key={report.id}>
            <View style={styles.reportHeader}>
              <UserBylineTag
                user={report.author}
                prefix={'Reported by'}
                onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {userID: report.author.userID})}
              />
              <RelativeTimeTag date={new Date(report.creationTime)} />
            </View>
            <Text>{statusLabel}</Text>
            {!!report.submitterMessage && <Text style={styles.message}>{report.submitterMessage}</Text>}
          </PaddedContentView>
        );
      })}
    </>
  );
};
