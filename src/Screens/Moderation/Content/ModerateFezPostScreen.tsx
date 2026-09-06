import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import {ModeratorReportFAB} from '#src/Components/Buttons/FloatingActionButtons/ModeratorReportFAB';
import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {FezPostListItem} from '#src/Components/Lists/Items/FezPostListItem';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationContentReportsSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentReportsSectionView';
import {ModerationContentSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentSectionView';
import {ModerationContentVisibilitySectionView} from '#src/Components/Views/Moderation/Content/ModerationContentVisibilitySectionView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ModerationDeletedWarningView} from '#src/Components/Views/Warnings/ModerationDeletedWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {FezType} from '#src/Enums/FezType';
import {useModerationContentActions} from '#src/Hooks/Moderation/useModerationContentActions';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertDeleteModeratedContent, alertViewPrivateSeamail} from '#src/Libraries/Alerts/ModerationAlerts';
import {getFezPublicShare} from '#src/Libraries/Moderation/Share';
import {ShareContentType} from '#src/Libraries/Sharing';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useFezPostDeleteMutation} from '#src/Queries/Fez/FezPostMutations';
import {useFezPostModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {FezPostModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderateFezPostScreen>;

const ModerateFezPostScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {setSnackbarPayload} = useSnackbar();
  const {commonStyles} = useStyles();
  const {data, refetch, isLoading} = useFezPostModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(FezPostModerationData.getCacheKeys(id));
  const deleteMutation = useFezPostDeleteMutation();
  const fezShare = data ? getFezPublicShare(data.fezType, data.fezID) : undefined;
  const getNavButtons = useModerationHeaderButtons({
    moderateType: ShareContentType.fezPostModerate,
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
        post: {
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingTopSmall,
          ...commonStyles.paddingBottomSmall,
        },
      }),
    [commonStyles],
  );

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

  const onViewInContext = () => {
    const openChat = () => {
      navigation.push(FezType.getChatScreen(data.fezType), {
        fezID: data.fezID,
      });
    };
    if (FezType.isSeamailType(data.fezType)) {
      alertViewPrivateSeamail(openChat);
      return;
    }
    openChat();
  };

  return (
    <AppView>
      <ModerationDeletedWarningView contentLabel={'post'} visible={data.isDeleted} />
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ModerationContentSectionView testIDPrefix={'fezPostModerate'} onViewInContext={onViewInContext}>
          <View style={styles.post}>
            <FezPostListItem fezPost={data.fezPost} fullWidth={true} />
          </View>
        </ModerationContentSectionView>
        <ModerationContentVisibilitySectionView
          data={data}
          testIDPrefix={'fezPostModerate'}
          onDelete={onDelete}
          isDeleting={deleteMutation.isPending}
        />
        <ModerationContentReportsSectionView reports={data.reports} />
      </ScrollingContentView>
      <ModeratorReportFAB
        reports={data.reports}
        moderateUserID={data.fezPost.author.userID}
        testIDPrefix={'fezPostModerate'}
        onHandleAll={() => actions.handleAll(data.reports)}
        onCloseAll={() => actions.closeAll(data.reports)}
      />
    </AppView>
  );
};

export const ModerateFezPostScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModerateFezPostScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
