import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Menu, Text, TextInput} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationActionRow} from '#src/Components/Views/Moderation/ModerationActionRow';
import {ModerationReportGroupListItem} from '#src/Components/Views/Moderation/ModerationReportGroupListItem';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {useMenu} from '#src/Hooks/useMenu';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {useRefresh} from '#src/Hooks/useRefresh';
import {generateReportContentGroups} from '#src/Libraries/Moderation';
import {invalidateQueryKeys} from '#src/Libraries/QueryInvalidation';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {
  useUserSetAccessLevelMutation,
  useUserTempQuarantineMutation,
} from '#src/Queries/Moderation/ModerationMutations';
import {useUserModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {ModeratorActionLogResponseData, UserModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.userModerateScreen>;

const moderatorAccessLevels = [UserAccessLevel.quarantined, UserAccessLevel.verified];
const thoAccessLevels = [
  UserAccessLevel.unverified,
  UserAccessLevel.banned,
  UserAccessLevel.quarantined,
  UserAccessLevel.verified,
];

const UserModerateScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const queryClient = useQueryClient();
  const {setSnackbarPayload} = useSnackbar();
  const {hasTHO} = usePrivilege();
  const {commonStyles} = useStyles();
  const {data, refetch, isLoading} = useUserModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const accessMutation = useUserSetAccessLevelMutation();
  const quarantineMutation = useUserTempQuarantineMutation();
  const {visible, openMenu, closeMenu} = useMenu();
  const [hours, setHours] = useState('');
  useModerationHelpHeader();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          ...commonStyles.flexRow,
          ...commonStyles.flexWrap,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.gapSmall,
        },
        input: {
          ...commonStyles.flex,
        },
      }),
    [commonStyles],
  );

  const allowedLevels = hasTHO ? thoAccessLevels : moderatorAccessLevels;
  const groups = useMemo(() => (data ? generateReportContentGroups(data.reports) : []), [data]);

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  const invalidate = async () => {
    await invalidateQueryKeys(
      queryClient,
      UserModerationData.getCacheKeys(id).concat(ModeratorActionLogResponseData.getCacheKeys()),
    );
  };

  const onSetAccessLevel = (accessLevel: UserAccessLevel) => {
    closeMenu();
    accessMutation.mutate(
      {userID: id, accessLevel},
      {
        onSuccess: async () => {
          await invalidate();
          setSnackbarPayload({
            message: `Access level set to ${UserAccessLevel.getLabel(accessLevel)}.`,
            messageType: 'info',
          });
        },
      },
    );
  };

  const applyTempQuarantine = (value: number) => {
    quarantineMutation.mutate(
      {userID: id, hours: value},
      {
        onSuccess: async () => {
          await invalidate();
          setHours('');
          setSnackbarPayload({
            message: value === 0 ? 'Temporary quarantine cleared.' : `Temporary quarantine set for ${value} hours.`,
            messageType: 'info',
          });
        },
      },
    );
  };

  const onStartQuarantine = () => {
    const parsed = Number.parseInt(hours, 10);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 200) {
      setSnackbarPayload({message: 'Enter a number of hours between 0 and 200.', messageType: 'error'});
      return;
    }
    applyTempQuarantine(parsed);
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <UserBylineTag
            user={data.header}
            onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {userID: data.header.userID})}
          />
          <Text>Access level: {UserAccessLevel.getLabel(data.accessLevel)}</Text>
          {data.tempQuarantineEndTime ? (
            <Text>Temporary quarantine ends {data.tempQuarantineEndTime}</Text>
          ) : (
            <Text>No temporary quarantine.</Text>
          )}
        </PaddedContentView>
        <PaddedContentView>
          <ModerationActionRow
            buttons={[
              {
                label: 'View Profile',
                onPress: () => navigation.push(CommonStackComponents.userProfileScreen, {userID: id}),
              },
              {
                label: 'Moderate Profile',
                onPress: () => navigation.push(CommonStackComponents.profileModerateScreen, {id}),
              },
            ]}
          />
        </PaddedContentView>
        <PaddedContentView>
          <View style={styles.row}>
            <Menu
              visible={visible}
              onDismiss={closeMenu}
              anchor={
                <Button mode={'contained'} compact={true} disabled={accessMutation.isPending} onPress={openMenu}>
                  Set Access Level
                </Button>
              }>
              {allowedLevels.map(level => (
                <Menu.Item
                  key={level}
                  dense={false}
                  title={UserAccessLevel.getLabel(level)}
                  disabled={level === data.accessLevel}
                  onPress={() => onSetAccessLevel(level)}
                />
              ))}
            </Menu>
          </View>
        </PaddedContentView>
        <PaddedContentView>
          <Text>Temporary quarantine (0–200 hours; 0 clears).</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              mode={'outlined'}
              keyboardType={'number-pad'}
              value={hours}
              onChangeText={setHours}
              placeholder={'Hours'}
              dense={true}
            />
            <Button
              mode={'contained'}
              compact={true}
              disabled={quarantineMutation.isPending}
              onPress={onStartQuarantine}>
              Start Quarantine
            </Button>
            <Button
              mode={'outlined'}
              compact={true}
              disabled={quarantineMutation.isPending || !data.tempQuarantineEndTime}
              onPress={() => applyTempQuarantine(0)}>
              Cancel Quarantine
            </Button>
          </View>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Alternate Accounts</ListSubheader>
        </ListSection>
        {data.subAccounts.length === 0 ? (
          <PaddedContentView padTop={true}>
            <Text>No alternate accounts.</Text>
          </PaddedContentView>
        ) : (
          data.subAccounts.map(account => (
            <PaddedContentView key={account.userID} padTop={true}>
              <UserBylineTag
                user={account}
                onPress={() => navigation.push(CommonStackComponents.userModerateScreen, {id: account.userID})}
              />
            </PaddedContentView>
          ))
        )}
        <ListSection>
          <ListSubheader>Reports against this user's content</ListSubheader>
        </ListSection>
        {groups.length === 0 ? (
          <PaddedContentView padTop={true}>
            <Text>No reports against this user's content.</Text>
          </PaddedContentView>
        ) : (
          groups.map(group => (
            <ModerationReportGroupListItem key={`${group.reportType}-${group.reportedID}`} group={group} />
          ))
        )}
      </ScrollingContentView>
    </AppView>
  );
};

export const UserModerateScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <UserModerateScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
