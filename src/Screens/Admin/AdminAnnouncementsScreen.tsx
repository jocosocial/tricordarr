import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {Text} from 'react-native-paper';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {AnnouncementCard} from '#src/Components/Cards/MainScreen/AnnouncementCard';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useAnnouncementsQuery} from '#src/Queries/Alert/AnnouncementQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminAnnouncementsScreen>;

export const AdminAnnouncementsScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminAnnouncementsScreenInner {...props} />
    </AdminAccessScreen>
  );
};

/**
 * Lists all announcements as the same cards shown on Today, including inactive/deleted ones.
 */
const AdminAnnouncementsScreenInner = ({navigation}: Props) => {
  const {data, refetch, isLoading} = useAnnouncementsQuery({}, true);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const {commonStyles} = useStyles();
  useAdminHelpButton(CommonStackComponents.announcementHelpScreen);

  if (isLoading && !data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        style={commonStyles.paddingTopSmall}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {!data?.length && (
          <PaddedContentView padTop={true}>
            <Text>No announcements.</Text>
          </PaddedContentView>
        )}
        {data?.map(announcement => (
          <PaddedContentView key={announcement.id}>
            <AnnouncementCard
              announcement={announcement}
              onPress={() => navigation.push(CommonStackComponents.adminAnnouncementEditScreen, {announcement})}
            />
          </PaddedContentView>
        ))}
      </ScrollingContentView>
      <BaseFAB
        testID={'announcementCreate-fab'}
        label={'New Announcement'}
        onPress={() => navigation.push(CommonStackComponents.adminAnnouncementEditScreen, {})}
      />
    </AppView>
  );
};
