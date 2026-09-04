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
import {ModeratorStateView} from '#src/Components/Views/Moderation/ModeratorStateView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {useRefresh} from '#src/Hooks/useRefresh';
import {profilePublicDataFromUpload} from '#src/Libraries/Moderation';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useProfileModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.profileModerateScreen>;

const ProfileModerateScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {data, refetch, isLoading} = useProfileModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  useModerationHelpHeader(id);

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  const header = data.profile.header;
  const publicProfile = profilePublicDataFromUpload(data.profile);
  const profileText = [
    data.profile.displayName && `Display name: ${data.profile.displayName}`,
    data.profile.realName && `Real name: ${data.profile.realName}`,
    data.profile.homeLocation && `Home: ${data.profile.homeLocation}`,
    data.profile.roomNumber && `Cabin: ${data.profile.roomNumber}`,
    data.profile.email && `Email: ${data.profile.email}`,
    data.profile.message && `Message: ${data.profile.message}`,
    data.profile.about && `About: ${data.profile.about}`,
    data.profile.discordUsername && `Discord: ${data.profile.discordUsername}`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          {header ? (
            <ModerationEditListItem author={header} text={profileText} />
          ) : (
            <Text>{profileText || 'Empty profile.'}</Text>
          )}
        </PaddedContentView>
        <PaddedContentView>
          <ModerationActionRow
            buttons={[
              {
                label: 'Edit',
                disabled: !publicProfile,
                onPress: () => {
                  if (publicProfile) {
                    navigation.push(CommonStackComponents.userProfileEditScreen, {user: publicProfile});
                  }
                },
              },
              {
                label: 'View Profile',
                onPress: () => navigation.push(CommonStackComponents.userProfileScreen, {userID: id}),
              },
            ]}
          />
        </PaddedContentView>
        <PaddedContentView>
          <ModeratorStateView data={data} />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Edit History</ListSubheader>
        </ListSection>
        {data.edits.length === 0 ? (
          <PaddedContentView padTop={true}>
            <Text>No previous profile edits.</Text>
          </PaddedContentView>
        ) : (
          data.edits.map(edit => (
            <PaddedContentView key={edit.editID} padTop={true}>
              {edit.profileData && edit.author && (
                <ModerationEditListItem
                  author={edit.author}
                  timestamp={edit.createdAt}
                  text={[
                    edit.profileData.displayName && `Display name: ${edit.profileData.displayName}`,
                    edit.profileData.realName && `Real name: ${edit.profileData.realName}`,
                    edit.profileData.homeLocation && `Home: ${edit.profileData.homeLocation}`,
                    edit.profileData.roomNumber && `Cabin: ${edit.profileData.roomNumber}`,
                    edit.profileData.message && `Message: ${edit.profileData.message}`,
                    edit.profileData.about && `About: ${edit.profileData.about}`,
                  ]
                    .filter(Boolean)
                    .join('\n')}
                />
              )}
              {edit.profileImage && <APIImage path={edit.profileImage} />}
              {!edit.profileData && !edit.profileImage && edit.author && (
                <ModerationEditListItem
                  author={edit.author}
                  timestamp={edit.createdAt}
                  text={'Profile image or fields changed.'}
                />
              )}
            </PaddedContentView>
          ))
        )}
        <ListSection>
          <ListSubheader>Reports</ListSubheader>
        </ListSection>
        {data.reports.length === 0 ? (
          <PaddedContentView padTop={true}>
            <Text>No reports on this profile.</Text>
          </PaddedContentView>
        ) : (
          data.reports.map(report => <ModerationReportListItem key={report.id} report={report} />)
        )}
      </ScrollingContentView>
    </AppView>
  );
};

export const ProfileModerateScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ProfileModerateScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
