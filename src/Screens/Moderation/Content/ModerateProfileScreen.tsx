import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect} from 'react';
import {Text} from 'react-native-paper';

import {ModeratorReportFAB} from '#src/Components/Buttons/FloatingActionButtons/ModeratorReportFAB';
import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {APIImage} from '#src/Components/Images/APIImage';
import {ModerationEditListItem} from '#src/Components/Lists/Items/Moderation/ModerationEditListItem';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationContentAuthorSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentAuthorSectionView';
import {ModerationContentHistorySectionView} from '#src/Components/Views/Moderation/Content/ModerationContentHistorySectionView';
import {ModerationContentReportsSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentReportsSectionView';
import {ModerationContentSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentSectionView';
import {ModerationContentVisibilitySectionView} from '#src/Components/Views/Moderation/Content/ModerationContentVisibilitySectionView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {UserProfileView} from '#src/Components/Views/UserProfileView';
import {AppIcons} from '#src/Enums/Icons';
import {useModerationContentActions} from '#src/Hooks/Moderation/useModerationContentActions';
import {useRefresh} from '#src/Hooks/useRefresh';
import {profilePublicDataFromUpload} from '#src/Libraries/Moderation/Content';
import {ShareContentType} from '#src/Libraries/Sharing';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useProfileModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {ProfileEditLogData, ProfileModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderateProfileScreen>;

const ModerateProfileScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {data, refetch, isLoading} = useProfileModerationQuery(id);
  const {refreshing, setRefreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(ProfileModerationData.getCacheKeys(id));
  const getNavButtons = useModerationHeaderButtons({
    contentType: ShareContentType.user,
    contentID: id,
    contentIcon: AppIcons.user,
    moderateType: ShareContentType.profileModerate,
    moderateID: id,
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  /**
   * Renders one previous profile field or image edit.
   */
  const renderEdit = useCallback((edit: ProfileEditLogData) => {
    return (
      <>
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
      </>
    );
  }, []);

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  const publicProfile = profilePublicDataFromUpload(data.profile);

  const onEdit = () => {
    if (!publicProfile) {
      return;
    }
    navigation.push(CommonStackComponents.userProfileEditScreen, {user: publicProfile});
  };

  const onViewInContext = () => {
    navigation.push(CommonStackComponents.userProfileScreen, {userID: id});
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ModerationContentSectionView testIDPrefix={'profileModerate'} onViewInContext={onViewInContext}>
          {publicProfile ? (
            <UserProfileView user={publicProfile} setRefreshing={setRefreshing} />
          ) : (
            <PaddedContentView>
              <Text>Empty profile.</Text>
            </PaddedContentView>
          )}
        </ModerationContentSectionView>
        <ModerationContentVisibilitySectionView
          data={data}
          testIDPrefix={'profileModerate'}
          onEdit={publicProfile ? onEdit : undefined}
        />
        <ModerationContentHistorySectionView edits={data.edits} renderEdit={renderEdit} />
        <ModerationContentReportsSectionView reports={data.reports} />
        <ModerationContentAuthorSectionView moderateUserID={id} />
      </ScrollingContentView>
      <ModeratorReportFAB
        reports={data.reports}
        testIDPrefix={'profileModerate'}
        onHandleAll={() => actions.handleAll(data.reports)}
        onCloseAll={() => actions.closeAll(data.reports)}
      />
    </AppView>
  );
};

export const ModerateProfileScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModerateProfileScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
