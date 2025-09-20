// import React, {PropsWithChildren} from 'react';
// import {BaseSwipeable} from './BaseSwipeable.tsx';
// import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton.tsx';
// import {AppIcons} from '#src/libraries/Enums/Icons.ts';
// import {FezData} from '#src/libraries/Structs/ControllerStructs.tsx';
// import {useFezArchiveMutation} from '#src/Components/Queries/Fez/FezArchiveMutations.ts';
// import {useQueryClient} from '@tanstack/react-query';
// import {View} from 'react-native';
// import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
// import {StyleSheet} from 'react-native';
// import {useConfig} from '#src/Components/Context/Contexts/ConfigContext.ts';
// import {useAppTheme} from '#src/styles/Theme.ts';
// import {useSnackbar} from '#src/Components/Context/Contexts/SnackbarContext.ts';
// import {SnackbarPayload} from '#src/libraries/Types';
//
// interface SeamailListItemSwipeableProps extends PropsWithChildren {
//   fez: FezData;
// }

/**
 * @deprecated
 * @param props
 * @constructor
 */
// export const SeamailListItemSwipeable = (props: SeamailListItemSwipeableProps) => {
// const archiveMutation = useFezArchiveMutation();
// const queryClient = useQueryClient();
// const {commonStyles} = useStyles();
// const {appConfig} = useConfig();
// const theme = useAppTheme();
// const {setSnackbarPayload} = useSnackbar();
//
// const styles = StyleSheet.create({
//   swipeRow: {
//     ...commonStyles.flexRow,
//     ...commonStyles.flex,
//     ...(appConfig.userPreferences.reverseSwipeOrientation
//       ? commonStyles.justifyContentStart
//       : commonStyles.justifyContentEnd),
//     ...commonStyles.twitarrPositive,
//   },
// });
//
// const handleArchive = async (isArchived: boolean) => {
//   const action = isArchived ? 'unarchive' : 'archive';
//   await archiveMutation.mutateAsync({
//     action: action,
//     fezID: props.fez.fezID,
//   });
//   const archivedPayload: SnackbarPayload = {
//     message: 'Archived successfully.',
//     action: {
//       label: 'Undo',
//       // Inverse because we've already performed the action but haven't refreshed props yet.
//       onPress: () => handleArchive(!isArchived),
//     },
//   };
//   const undoPayload: SnackbarPayload = {
//     message: 'Restored successfully.',
//     duration: 3000,
//   };
//   setSnackbarPayload(action === 'archive' ? archivedPayload : undoPayload);
//   const invalidations = FezData.getCacheKeys(props.fez.fezID).map(key => {
//     return queryClient.invalidateQueries(key);
//   });
//   await Promise.all(invalidations);
// };
//
// const renderArchivePanel = () => {
//   return (
//     <>
//       {props.fez.members && (
//         <View style={styles.swipeRow}>
//           <SwipeableButton
//             text={props.fez.members.isArchived ? 'Unarchive' : 'Archive'}
//             iconName={AppIcons.archive}
//             refreshing={archiveMutation.isLoading}
//             style={commonStyles.twitarrPositive}
//             textStyle={commonStyles.onTwitarrButton}
//             iconColor={theme.colors.onTwitarrPositiveButton}
//           />
//         </View>
//       )}
//     </>
//   );
// };
//
// // Helps with Typescript typing
// const fezMembersData = props.fez.members;
//
// return (
//   <BaseSwipeable
//     enabled={false}
//     onSwipeableWillOpen={fezMembersData ? () => handleArchive(fezMembersData.isArchived) : undefined}
//     renderRightPanel={renderArchivePanel}>
//     {props.children}
//   </BaseSwipeable>
// );
// };
