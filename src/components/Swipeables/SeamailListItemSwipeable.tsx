import React, {PropsWithChildren} from 'react';
import {BaseSwipeable} from './BaseSwipeable.tsx';
import {SwipeableButton} from '../Buttons/SwipeableButton.tsx';
import {AppIcons} from '../../libraries/Enums/Icons.ts';
import {FezData} from '../../libraries/Structs/ControllerStructs.tsx';
import {useFezArchiveMutation} from '../Queries/Fez/FezArchiveMutations.ts';
import {useQueryClient} from '@tanstack/react-query';
import {View} from 'react-native';
import {useStyles} from '../Context/Contexts/StyleContext.ts';
import {StyleSheet} from 'react-native';
import {useConfig} from '../Context/Contexts/ConfigContext.ts';
import {useAppTheme} from '../../styles/Theme.ts';
import {useSnackbar} from '../Context/Contexts/SnackbarContext.ts';
import {SnackbarPayload} from '../../libraries/Types';

interface SeamailListItemSwipeableProps extends PropsWithChildren {
  fez: FezData;
}

export const SeamailListItemSwipeable = (props: SeamailListItemSwipeableProps) => {
  const archiveMutation = useFezArchiveMutation();
  const queryClient = useQueryClient();
  const {commonStyles} = useStyles();
  const {appConfig} = useConfig();
  const theme = useAppTheme();
  const {setSnackbarPayload} = useSnackbar();

  const styles = StyleSheet.create({
    swipeRow: {
      ...commonStyles.flexRow,
      ...commonStyles.flex,
      ...(appConfig.userPreferences.reverseSwipeOrientation
        ? commonStyles.justifyContentStart
        : commonStyles.justifyContentEnd),
      ...commonStyles.twitarrPositive,
    },
  });

  const handleArchive = async (isArchived: boolean) => {
    const action = isArchived ? 'unarchive' : 'archive';
    await archiveMutation.mutateAsync({
      action: action,
      fezID: props.fez.fezID,
    });
    const archivedPayload: SnackbarPayload = {
      message: 'Archived successfully.',
      action: {
        label: 'Undo',
        // Inverse because we've already performed the action but haven't refreshed props yet.
        onPress: () => handleArchive(!isArchived),
      },
    };
    const undoPayload: SnackbarPayload = {
      message: 'Restored successfully.',
      duration: 3000,
    };
    setSnackbarPayload(action === 'archive' ? archivedPayload : undoPayload);
    const invalidations = FezData.getCacheKeys(props.fez.fezID).map(key => {
      return queryClient.invalidateQueries(key);
    });
    await Promise.all(invalidations);
  };

  const renderArchivePanel = () => {
    return (
      <>
        {props.fez.members && (
          <View style={styles.swipeRow}>
            <SwipeableButton
              text={props.fez.members.isArchived ? 'Unarchive' : 'Archive'}
              iconName={AppIcons.archive}
              refreshing={archiveMutation.isLoading}
              style={commonStyles.twitarrPositive}
              textStyle={commonStyles.onTwitarrButton}
              iconColor={theme.colors.onTwitarrPositiveButton}
            />
          </View>
        )}
      </>
    );
  };

  // Helps with Typescript typing
  const fezMembersData = props.fez.members;

  return (
    <BaseSwipeable
      onSwipeableWillOpen={fezMembersData ? () => handleArchive(fezMembersData.isArchived) : undefined}
      renderRightPanel={renderArchivePanel}>
      {props.children}
    </BaseSwipeable>
  );
};
