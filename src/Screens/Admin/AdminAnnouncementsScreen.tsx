import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
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

const AdminAnnouncementsScreenInner = ({navigation}: Props) => {
  const {data, refetch, isLoading} = useAnnouncementsQuery({}, true);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  useAdminHelpButton();

  if (isLoading && !data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <ListSubheader>Announcements</ListSubheader>
        </ListSection>
        {!data?.length && (
          <PaddedContentView padTop={true}>
            <Text>No announcements.</Text>
          </PaddedContentView>
        )}
        {data?.map(announcement => (
          <View key={announcement.id}>
            <DataFieldListItem
              title={
                announcement.isDeleted ? `Deleted · ${announcement.author.username}` : announcement.author.username
              }
              description={announcement.text}
              onPress={() => navigation.push(CommonStackComponents.adminAnnouncementEditScreen, {announcement})}
            />
            <DataFieldListItem
              title={'Display Until'}
              description={new Date(announcement.displayUntil).toLocaleString()}
            />
          </View>
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
