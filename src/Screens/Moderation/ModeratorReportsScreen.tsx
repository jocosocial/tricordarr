import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationReportGroupListItem} from '#src/Components/Views/Moderation/ModerationReportGroupListItem';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {useRefresh} from '#src/Hooks/useRefresh';
import {filterReportGroupsByClosed, generateReportContentGroups, isClosedReportsParam} from '#src/Libraries/Moderation';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useModerationReportsQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderatorReportsScreen>;

const ModeratorReportsScreenInner = ({route}: Props) => {
  const {commonStyles} = useStyles();
  const {data, refetch, isLoading} = useModerationReportsQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  useModerationHelpHeader();
  const showClosed = isClosedReportsParam(route.params.closed);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        empty: {
          ...commonStyles.marginTopSmall,
        },
      }),
    [commonStyles],
  );

  const groups = useMemo(() => {
    if (!data) {
      return [];
    }
    return filterReportGroupsByClosed(generateReportContentGroups(data), showClosed);
  }, [data, showClosed]);

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {groups.length === 0 ? (
          <PaddedContentView>
            <Text style={styles.empty}>{showClosed ? 'No closed reports.' : 'No open reports. Nice work.'}</Text>
          </PaddedContentView>
        ) : (
          <View>
            <ListSection>
              {groups.map(group => (
                <ModerationReportGroupListItem key={`${group.reportType}-${group.reportedID}`} group={group} />
              ))}
            </ListSection>
          </View>
        )}
      </ScrollingContentView>
    </AppView>
  );
};

export const ModeratorReportsScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModeratorReportsScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
