import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {Text} from 'react-native-paper';

import {ModeratorReportFAB} from '#src/Components/Buttons/FloatingActionButtons/ModeratorReportFAB';
import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {APIImage} from '#src/Components/Images/APIImage';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationContentReportsSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentReportsSectionView';
import {ModerationActionRow} from '#src/Components/Views/Moderation/ModerationActionRow';
import {ModerationEditListItem} from '#src/Components/Lists/Items/Moderation/ModerationEditListItem';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ModerationDeletedWarningView} from '#src/Components/Views/Warnings/ModerationDeletedWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useModerationContentActions} from '#src/Hooks/Moderation/useModerationContentActions';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertDeleteModeratedContent} from '#src/Libraries/Alerts/ModerationAlerts';
import {ShareContentType} from '#src/Libraries/Sharing';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {usePhotostreamModerationDeleteMutation} from '#src/Queries/Moderation/ModerationMutations';
import {usePhotostreamModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {PhotostreamModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderatePhotostreamScreen>;

const ModeratePhotostreamScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {setSnackbarPayload} = useSnackbar();
  const {theme} = useAppTheme();
  const {data, refetch, isLoading} = usePhotostreamModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(PhotostreamModerationData.getCacheKeys(id));
  const deleteMutation = usePhotostreamModerationDeleteMutation();
  const getNavButtons = useModerationHeaderButtons({
    moderateType: ShareContentType.photostreamModerate,
    moderateID: id,
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  const onDelete = () => {
    alertDeleteModeratedContent('photostream photo', () => {
      deleteMutation.mutate(
        {photoID: id},
        {
          onSuccess: async () => {
            await actions.invalidate();
            setSnackbarPayload({message: 'Photo deleted.', messageType: 'info'});
          },
        },
      );
    });
  };

  return (
    <AppView>
      <ModerationDeletedWarningView contentLabel={'photostream photo'} visible={data.isDeleted} />
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <ListSubheader>Content</ListSubheader>
        </ListSection>
        <PaddedContentView>
          <ModerationEditListItem
            author={data.photo.author}
            timestamp={data.photo.createdAt}
            text={data.photo.event?.title ?? data.photo.location}
          />
          {!data.isDeleted && <APIImage path={data.photo.image} />}
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'photostreamModerateView-button'}
            buttonText={'View Author Photos'}
            buttonColor={theme.colors.twitarrNeutralButton}
            onPress={() => navigation.push(CommonStackComponents.photostreamUserScreen, {user: data.photo.author})}
          />
        </PaddedContentView>
        <PaddedContentView>
          <Text>Photostream photos cannot be quarantined. Delete the photo if it should not stay public.</Text>
        </PaddedContentView>
        {!data.isDeleted && (
          <PaddedContentView>
            <ModerationActionRow
              buttons={[
                {
                  label: 'Delete',
                  disabled: deleteMutation.isPending,
                  onPress: onDelete,
                },
              ]}
            />
          </PaddedContentView>
        )}
        <ModerationContentReportsSectionView reports={data.reports} />
      </ScrollingContentView>
      <ModeratorReportFAB
        reports={data.reports}
        moderateUserID={data.photo.author.userID}
        testIDPrefix={'photostreamModerate'}
        onHandleAll={() => actions.handleAll(data.reports)}
        onCloseAll={() => actions.closeAll(data.reports)}
      />
    </AppView>
  );
};

export const ModeratePhotostreamScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModeratePhotostreamScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
