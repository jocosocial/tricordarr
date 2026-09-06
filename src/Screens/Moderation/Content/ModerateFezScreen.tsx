import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {ModeratorReportFAB} from '#src/Components/Buttons/FloatingActionButtons/ModeratorReportFAB';
import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ModeratorContentSegmentedButtons} from '#src/Components/Buttons/SegmentedButtons/ModeratorContentSegmentedButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationEditList} from '#src/Components/Views/Moderation/ModerationEditList';
import {ModerationEditListItem} from '#src/Components/Views/Moderation/ModerationEditListItem';
import {ModerationNoReportsView} from '#src/Components/Views/Moderation/ModerationNoReportsView';
import {ModerationReportListItem} from '#src/Components/Views/Moderation/ModerationReportListItem';
import {ModeratorStateView} from '#src/Components/Views/Moderation/ModeratorStateView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ModerationDeletedWarningView} from '#src/Components/Views/Warnings/ModerationDeletedWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {FezType} from '#src/Enums/FezType';
import {useModerationContentActions} from '#src/Hooks/Moderation/useModerationContentActions';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertDeleteModeratedContent} from '#src/Libraries/Alerts/ModerationAlerts';
import {getFezPublicShare} from '#src/Libraries/Moderation/Share';
import {ShareContentType} from '#src/Libraries/Sharing';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useFezDeleteMutation} from '#src/Queries/Fez/FezMutations';
import {useFezModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {FezEditLogData, FezModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderateFezScreen>;

const ModerateFezScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {setSnackbarPayload} = useSnackbar();
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {data, refetch, isLoading} = useFezModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(FezModerationData.getCacheKeys(id));
  const deleteMutation = useFezDeleteMutation();
  const fezShare = data ? getFezPublicShare(data.fez.fezType, data.fez.fezID) : undefined;
  const getNavButtons = useModerationHeaderButtons({
    moderateType: ShareContentType.fezModerate,
    moderateID: id,
    ...fezShare,
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        editDelete: {
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingBottomSmall,
        },
      }),
    [commonStyles],
  );

  /**
   * Renders one previous fez title/info/location edit as a compact content row.
   */
  const renderEdit = useCallback((edit: FezEditLogData) => {
    return (
      <ModerationEditListItem
        author={edit.author}
        timestamp={edit.createdAt}
        text={[edit.title, edit.info, edit.location].filter(Boolean).join('\n')}
      />
    );
  }, []);

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
      <ModerationDeletedWarningView contentLabel={contentLabel} visible={data.isDeleted} />
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <ListSubheader>Content</ListSubheader>
        </ListSection>
        <PaddedContentView>
          <ModerationEditListItem
            author={fez.owner}
            timestamp={fez.lastModificationTime}
            text={[fez.title, fez.info, fez.location].filter(Boolean).join('\n')}
          />
          <Text>{FezType.getLabel(fez.fezType)}</Text>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'fezModerateView-button'}
            buttonText={isLfg ? 'View LFG' : 'View Chat'}
            buttonColor={theme.colors.twitarrNeutralButton}
            onPress={onView}
          />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Visibility</ListSubheader>
        </ListSection>
        <ModeratorStateView data={data} />
        {!data.isDeleted && (
          <View style={styles.editDelete}>
            <ModeratorContentSegmentedButtons
              testIDPrefix={'fezModerate'}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={deleteMutation.isPending}
            />
          </View>
        )}
        <ModerationEditList edits={data.edits} renderEdit={renderEdit} />
        <ListSection>
          <ListSubheader>Reports</ListSubheader>
        </ListSection>
        {data.reports.length === 0 ? (
          <ModerationNoReportsView />
        ) : (
          data.reports.map(report => <ModerationReportListItem key={report.id} report={report} />)
        )}
      </ScrollingContentView>
      <ModeratorReportFAB
        reports={data.reports}
        moderateUserID={fez.owner.userID}
        testIDPrefix={'fezModerate'}
        onHandleAll={() => actions.handleAll(data.reports)}
        onCloseAll={() => actions.closeAll(data.reports)}
      />
    </AppView>
  );
};

export const ModerateFezScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModerateFezScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
