import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {Divider} from 'react-native-paper';

import {useAdminHeaderButtons} from '#src/Components/Buttons/HeaderButtons/AdminHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {NavigationListItem} from '#src/Components/Lists/Items/NavigationListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useForumCategoriesQuery} from '#src/Queries/Forum/ForumCategoryQueries';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {NoAccessScreen} from '#src/Screens/Checkpoint/NoAccessScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.shutternautHomeScreen>;

/**
 * Title of the Shutternaut-only forum category, from Swiftarr's `Migrations/Categories.swift`.
 * `CategoryData` carries no role or slug, so the title is the only stable way to find it. The server
 * leaves the category out of the list for anyone lacking the role, so a miss just hides the row.
 */
const SHUTTERNAUT_CATEGORY_TITLE = 'Shutternauts';

/**
 * Hub for everything Shutternaut: the shared calendar, the Shutternaut forum category, and the
 * manager-only report and role management.
 *
 * The access checkpoint matches the Shutternaut Calendar, the one feature every holder of the hub
 * can use. No PreRegistrationScreen checkpoint: everything it links to is reachable in
 * pre-registration.
 */
export const ShutternautHomeScreen = (props: Props) => {
  const {hasShutternaut, hasShutternautManager} = useRoles();
  const {hasTwitarrTeam} = usePrivilege();

  return (
    <LoggedInScreen>
      <NoAccessScreen hasAccess={hasShutternaut || hasShutternautManager || hasTwitarrTeam}>
        <ShutternautHomeScreenInner {...props} />
      </NoAccessScreen>
    </LoggedInScreen>
  );
};

const ShutternautHomeScreenInner = ({navigation}: Props) => {
  const {hasShutternautManager} = useRoles();
  const {hasTwitarrTeam} = usePrivilege();
  const {data: categories, refetch} = useForumCategoriesQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const getNavButtons = useAdminHeaderButtons(CommonStackComponents.shutternautHelpScreen);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const forumCategory = categories?.find(category => category.title === SHUTTERNAUT_CATEGORY_TITLE);

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Divider bold={true} />
        <ListSection>
          <NavigationListItem
            title={'Shared Calendar'}
            description={
              'Group calendar showing what events are getting photographed and what you signed up to photograph.'
            }
            navComponent={CommonStackComponents.shutternautCalendarScreen}
          />
          {forumCategory && (
            <NavigationListItem
              title={'Shutternaut Forums'}
              description={'Dedicated forum category for Shutternaut internal discussion'}
              navComponent={CommonStackComponents.forumCategoryScreen}
              params={{categoryID: forumCategory.categoryID}}
            />
          )}
          {(hasShutternautManager || hasTwitarrTeam) && (
            <NavigationListItem
              title={'Photographer Report'}
              description={'Cruise-wide photography coverage of flagged and assigned events.'}
              navComponent={CommonStackComponents.shutternautReportScreen}
            />
          )}
          {(hasShutternautManager || hasTwitarrTeam) && (
            <NavigationListItem
              title={'Manage Shutternauts'}
              description={'Grant or revoke the Shutternaut role.'}
              navComponent={CommonStackComponents.shutternautManageScreen}
            />
          )}
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
