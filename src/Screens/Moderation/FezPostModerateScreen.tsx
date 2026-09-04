import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationActionRow} from '#src/Components/Views/Moderation/ModerationActionRow';
import {ModerationEditListItem} from '#src/Components/Views/Moderation/ModerationEditListItem';
import {ModerationReportListItem} from '#src/Components/Views/Moderation/ModerationReportListItem';
import {ModeratorStateView} from '#src/Components/Views/Moderation/ModeratorStateView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ModerationDeletedWarningView} from '#src/Components/Views/Warnings/ModerationDeletedWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {FezType} from '#src/Enums/FezType';
import {useModerationContentActions} from '#src/Hooks/useModerationContentActions';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertDeleteModeratedContent} from '#src/Libraries/Alerts/ModerationAlerts';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useFezPostDeleteMutation} from '#src/Queries/Fez/FezPostMutations';
import {useFezPostModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {FezPostModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.fezPostModerateScreen>;

const FezPostModerateScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {setSnackbarPayload} = useSnackbar();
  const {data, refetch, isLoading} = useFezPostModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(FezPostModerationData.getCacheKeys(id));
  const deleteMutation = useFezPostDeleteMutation();
  useModerationHelpHeader(data?.fezPost.author.userID);

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  const onDelete = () => {
    alertDeleteModeratedContent('post', () => {
      deleteMutation.mutate(
        {postID: id},
        {
          onSuccess: async () => {
            await actions.invalidate();
            setSnackbarPayload({message: 'Post deleted.', messageType: 'info'});
          },
        },
      );
    });
  };

  return (
    <AppView>
      <ModerationDeletedWarningView contentLabel={'post'} visible={data.isDeleted} />
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <ModerationEditListItem
            author={data.fezPost.author}
            timestamp={data.fezPost.timestamp}
            text={data.fezPost.text}
            images={data.fezPost.image ? [data.fezPost.image] : undefined}
          />
        </PaddedContentView>
        <PaddedContentView>
          <ModerationActionRow
            buttons={[
              {
                label: 'Delete',
                disabled: data.isDeleted || deleteMutation.isPending,
                onPress: onDelete,
              },
              {
                label: 'View in Context',
                onPress: () =>
                  navigation.push(FezType.getChatScreen(data.fezType), {
                    fezID: data.fezID,
                  }),
              },
            ]}
          />
        </PaddedContentView>
        <PaddedContentView>
          <ModeratorStateView data={data} />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Reports</ListSubheader>
        </ListSection>
        {data.reports.length === 0 ? (
          <PaddedContentView padTop={true}>
            <Text>No reports on this post.</Text>
          </PaddedContentView>
        ) : (
          data.reports.map(report => <ModerationReportListItem key={report.id} report={report} />)
        )}
      </ScrollingContentView>
    </AppView>
  );
};

export const FezPostModerateScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <FezPostModerateScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
