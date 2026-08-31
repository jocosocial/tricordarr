import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationActionRow} from '#src/Components/Views/Moderation/ModerationActionRow';
import {ModerationContentPreview} from '#src/Components/Views/Moderation/ModerationContentPreview';
import {ModerationDeletedNotice} from '#src/Components/Views/Moderation/ModerationDeletedNotice';
import {ModerationReportsSection} from '#src/Components/Views/Moderation/ModerationReportsSection';
import {ModerationStateActions} from '#src/Components/Views/Moderation/ModerationStateActions';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {FezType} from '#src/Enums/FezType';
import {useModerationContentActions} from '#src/Hooks/useModerationContentActions';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertDeleteModeratedContent} from '#src/Libraries/Alerts/ModerationAlerts';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
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
  useModerationHelpHeader();

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
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ModerationDeletedNotice contentLabel={'post'} visible={data.isDeleted} />
        <PaddedContentView padTop={true}>
          <ModerationContentPreview
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
                label: 'Mod User',
                onPress: () => pushModerateResource(navigation, 'user', data.fezPost.author.userID),
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
          <ModerationStateActions
            status={data.moderationStatus}
            disabled={data.isDeleted}
            isLoading={actions.isLoading}
            onSelect={state => actions.setState('fezpost', id, state)}
          />
        </PaddedContentView>
        <ModerationReportsSection
          reports={data.reports}
          contentLabel={'post'}
          isLoading={actions.isLoading}
          onHandleAll={() => actions.handleAll(data.reports)}
          onCloseAll={() => actions.closeAll(data.reports)}
        />
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
