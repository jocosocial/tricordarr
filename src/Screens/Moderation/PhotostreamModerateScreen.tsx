import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {APIImage} from '#src/Components/Images/APIImage';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationActionRow} from '#src/Components/Views/Moderation/ModerationActionRow';
import {ModerationEditListItem} from '#src/Components/Views/Moderation/ModerationEditListItem';
import {ModerationReportListItem} from '#src/Components/Views/Moderation/ModerationReportListItem';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ModerationDeletedWarningView} from '#src/Components/Views/Warnings/ModerationDeletedWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
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
import {usePhotostreamModerationDeleteMutation} from '#src/Queries/Moderation/ModerationMutations';
import {usePhotostreamModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {PhotostreamModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.photostreamModerateScreen>;

const PhotostreamModerateScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {setSnackbarPayload} = useSnackbar();
  const {data, refetch, isLoading} = usePhotostreamModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(PhotostreamModerationData.getCacheKeys(id));
  const deleteMutation = usePhotostreamModerationDeleteMutation();
  useModerationHelpHeader();

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
        <PaddedContentView padTop={true}>
          <ModerationEditListItem
            author={data.photo.author}
            timestamp={data.photo.createdAt}
            text={data.photo.event?.title ?? data.photo.location}
          />
          {!data.isDeleted && <APIImage path={data.photo.image} />}
        </PaddedContentView>
        <PaddedContentView>
          <Text>Photostream photos cannot be quarantined. Delete the photo if it should not stay public.</Text>
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
                onPress: () => pushModerateResource(navigation, 'user', data.photo.author.userID),
              },
              {
                label: 'View Author Photos',
                onPress: () =>
                  navigation.push(CommonStackComponents.photostreamUserScreen, {user: data.photo.author}),
              },
            ]}
          />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Reports</ListSubheader>
        </ListSection>
        {data.reports.length === 0 ? (
          <PaddedContentView padTop={true}>
            <Text>No reports on this photo.</Text>
          </PaddedContentView>
        ) : (
          data.reports.map(report => <ModerationReportListItem key={report.id} report={report} />)
        )}
      </ScrollingContentView>
    </AppView>
  );
};

export const PhotostreamModerateScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <PhotostreamModerateScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
