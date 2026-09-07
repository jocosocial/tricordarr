import Slider from '@react-native-community/slider';
import {useQueryClient} from '@tanstack/react-query';
import pluralize from 'pluralize';
import React, {useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Menu, Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {useMenu} from '#src/Hooks/useMenu';
import {invalidateQueryKeys} from '#src/Libraries/QueryInvalidation';
import {
  useUserSetAccessLevelMutation,
  useUserTempQuarantineMutation,
} from '#src/Queries/Moderation/ModerationMutations';
import {ModeratorActionLogResponseData, UserModerationData} from '#src/Structs/ControllerStructs';

interface ModerationUserAccessSectionViewProps {
  userID: string;
  accessLevel: UserAccessLevel;
  tempQuarantineEndTime?: string;
  testIDPrefix: string;
}

const moderatorAccessLevels = [UserAccessLevel.quarantined, UserAccessLevel.verified];
const thoAccessLevels = [
  UserAccessLevel.unverified,
  UserAccessLevel.banned,
  UserAccessLevel.quarantined,
  UserAccessLevel.verified,
];

/**
 * Access section on the user moderate screen: current level, Set Access Level, temp quarantine, then hours slider.
 */
export const ModerationUserAccessSectionView = ({
  userID,
  accessLevel,
  tempQuarantineEndTime,
  testIDPrefix,
}: ModerationUserAccessSectionViewProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {hasTHO} = usePrivilege();
  const {setSnackbarPayload} = useSnackbar();
  const queryClient = useQueryClient();
  const {visible, openMenu, closeMenu} = useMenu();
  const accessMutation = useUserSetAccessLevelMutation();
  const quarantineMutation = useUserTempQuarantineMutation();
  const [hours, setHours] = useState(0);
  const allowedLevels = hasTHO ? thoAccessLevels : moderatorAccessLevels;
  const isDirty = hours !== 0;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        slider: {
          ...commonStyles.marginBottomSmall,
        },
        sliderLabel: {
          ...commonStyles.marginBottomSmall,
        },
        actions: {
          ...commonStyles.flexRow,
          ...commonStyles.gapSmall,
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingBottomSmall,
        },
        button: {
          ...commonStyles.flex,
        },
        buttonInner: {
          width: '100%',
        },
      }),
    [commonStyles],
  );

  /**
   * Refetch user moderation data and the moderator action log after an account change.
   */
  const invalidate = async () => {
    await invalidateQueryKeys(
      queryClient,
      UserModerationData.getCacheKeys(userID).concat(ModeratorActionLogResponseData.getCacheKeys()),
    );
  };

  /**
   * Apply a selected access level, then refresh cached moderation data.
   */
  const onSetAccessLevel = (level: UserAccessLevel) => {
    closeMenu();
    accessMutation.mutate(
      {userID, accessLevel: level},
      {
        onSuccess: async () => {
          await invalidate();
          setSnackbarPayload({
            message: `Access level set to ${UserAccessLevel.getLabel(level)}.`,
            messageType: 'info',
          });
        },
      },
    );
  };

  /**
   * Apply or clear a temporary quarantine. Pass 0 hours to clear. Resets the slider on success.
   */
  const applyTempQuarantine = (value: number) => {
    quarantineMutation.mutate(
      {userID, hours: value},
      {
        onSuccess: async () => {
          await invalidate();
          setHours(0);
          setSnackbarPayload({
            message: value === 0 ? 'Temporary quarantine cleared.' : `Temporary quarantine set for ${value} hours.`,
            messageType: 'info',
          });
        },
      },
    );
  };

  return (
    <View>
      <ListSection>
        <ListSubheader>Access</ListSubheader>
      </ListSection>
      <DataFieldListItem title={'Current Access Level'} description={UserAccessLevel.getLabel(accessLevel)} />
      <PaddedContentView>
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <PrimaryActionButton
              testID={`${testIDPrefix}SetAccessLevel-button`}
              buttonText={'Set Access Level'}
              buttonColor={theme.colors.twitarrNeutralButton}
              disabled={accessMutation.isPending}
              isLoading={accessMutation.isPending}
              onPress={openMenu}
            />
          }>
          {allowedLevels.map(level => (
            <Menu.Item
              key={level}
              dense={false}
              title={UserAccessLevel.getLabel(level)}
              disabled={level === accessLevel}
              onPress={() => onSetAccessLevel(level)}
            />
          ))}
        </Menu>
      </PaddedContentView>
      <DataFieldListItem
        title={'Temporary Quarantine'}
        description={tempQuarantineEndTime ? <RelativeTimeTag date={new Date(tempQuarantineEndTime)} /> : 'None'}
      />
      <PaddedContentView>
        <View style={styles.slider}>
          <Text style={styles.sliderLabel}>
            Duration: {hours} {pluralize('hour', hours)}
          </Text>
          <Slider
            testID={`${testIDPrefix}QuarantineHours-slider`}
            minimumValue={0}
            maximumValue={200}
            value={hours}
            disabled={quarantineMutation.isPending}
            onValueChange={value => setHours(Math.round(value))}
            step={1}
            thumbTintColor={theme.colors.onBackground}
          />
        </View>
      </PaddedContentView>
      <View style={styles.actions}>
        <PrimaryActionButton
          testID={`${testIDPrefix}StartQuarantine-button`}
          buttonText={'Start Quarantine'}
          buttonColor={theme.colors.twitarrNeutralButton}
          onPress={() => applyTempQuarantine(hours)}
          disabled={!isDirty || quarantineMutation.isPending}
          isLoading={quarantineMutation.isPending && isDirty}
          viewStyle={styles.button}
          style={styles.buttonInner}
        />
        <PrimaryActionButton
          testID={`${testIDPrefix}Cancel-button`}
          buttonText={'Cancel'}
          buttonColor={theme.colors.twitarrNegativeButton}
          onPress={() => applyTempQuarantine(0)}
          disabled={!tempQuarantineEndTime || quarantineMutation.isPending}
          viewStyle={styles.button}
          style={styles.buttonInner}
        />
      </View>
    </View>
  );
};
