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
import {useFezDeleteMutation} from '#src/Queries/Fez/FezMutations';
import {useFezModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {FezModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.fezModerateScreen>;

const FezModerateScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {setSnackbarPayload} = useSnackbar();
  const {data, refetch, isLoading} = useFezModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(FezModerationData.getCacheKeys(id));
  const deleteMutation = useFezDeleteMutation();
  useModerationHelpHeader();

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  const fez = data.fez;
  const isLfg = FezType.isLFGType(fez.fezType);
  const contentLabel = isLfg ? 'LFG' : 'seamail';

  const onDelete = () => {
    alertDeleteModeratedContent(contentLabel, () => {
      deleteMutation.mutate(
        {fezID: fez.fezID},
        {
          onSuccess: async () => {
            await actions.invalidate();
            setSnackbarPayload({message: `${contentLabel} deleted.`, messageType: 'info'});
          },
        },
      );
    });
  };

  const onView = () => {
    if (isLfg) {
      navigation.push(CommonStackComponents.lfgScreen, {fezID: fez.fezID});
      return;
    }
    navigation.push(FezType.getChatScreen(fez.fezType), {fezID: fez.fezID});
  };

  const onEdit = () => {
    if (isLfg) {
      navigation.push(CommonStackComponents.lfgEditScreen, {fez});
      return;
    }
    navigation.push(CommonStackComponents.seamailEditScreen, {fezID: fez.fezID});
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ModerationDeletedNotice contentLabel={contentLabel} visible={data.isDeleted} />
        <PaddedContentView padTop={true}>
          <ModerationContentPreview
            author={fez.owner}
            timestamp={fez.lastModificationTime}
            text={[fez.title, fez.info, fez.location].filter(Boolean).join('\n')}
          />
          <Text>{FezType.getLabel(fez.fezType)}</Text>
        </PaddedContentView>
        <PaddedContentView>
          <ModerationActionRow
            buttons={[
              {
                label: 'Edit',
                disabled: data.isDeleted,
                onPress: onEdit,
              },
              {
                label: 'Delete',
                disabled: data.isDeleted || deleteMutation.isPending,
                onPress: onDelete,
              },
              {
                label: 'Mod User',
                onPress: () => pushModerateResource(navigation, 'user', fez.owner.userID),
              },
              {
                label: isLfg ? 'View LFG' : 'View Chat',
                onPress: onView,
              },
            ]}
          />
        </PaddedContentView>
        <PaddedContentView>
          <ModerationStateActions
            status={data.moderationStatus}
            disabled={data.isDeleted}
            isLoading={actions.isLoading}
            onSelect={state => actions.setState('fez', id, state)}
          />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Edit History</ListSubheader>
        </ListSection>
        {data.edits.length === 0 ? (
          <PaddedContentView padTop={true}>
            <Text>No previous edits.</Text>
          </PaddedContentView>
        ) : (
          data.edits.map(edit => (
            <PaddedContentView key={edit.editID} padTop={true}>
              <ModerationContentPreview
                author={edit.author}
                timestamp={edit.createdAt}
                text={[edit.title, edit.info, edit.location].filter(Boolean).join('\n')}
              />
            </PaddedContentView>
          ))
        )}
        <ModerationReportsSection
          reports={data.reports}
          contentLabel={contentLabel}
          isLoading={actions.isLoading}
          onHandleAll={() => actions.handleAll(data.reports)}
          onCloseAll={() => actions.closeAll(data.reports)}
        />
      </ScrollingContentView>
    </AppView>
  );
};

export const FezModerateScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <FezModerateScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
