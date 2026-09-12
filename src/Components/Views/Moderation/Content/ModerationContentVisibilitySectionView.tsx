import React, {PropsWithChildren, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ModeratorStateView} from '#src/Components/Views/Moderation/ModeratorStateView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {ModeratedContentData} from '#src/Libraries/Moderation/ModerationStateContext';

interface ModerationContentVisibilitySectionViewProps extends PropsWithChildren {
  data?: ModeratedContentData;
  onEdit?: () => void;
  onDelete?: () => void;
  testIDPrefix: string;
  isDeleting?: boolean;
  isDeleted?: boolean;
  /**
   * When false, hides Set State. Use for types that cannot be quarantined.
   */
  canChangeState?: boolean;
}

/**
 * Visibility section on a content moderate screen: current state, edit/delete, then any extra actions.
 * Omit `onEdit` or `onDelete` when that action is not allowed; the button stays visible but disabled.
 * Pass `canChangeState={false}` when state cannot be changed; `data` is then optional.
 */
export const ModerationContentVisibilitySectionView = ({
  data,
  onEdit,
  onDelete,
  testIDPrefix,
  isDeleting,
  isDeleted: isDeletedProp,
  canChangeState = true,
  children,
}: ModerationContentVisibilitySectionViewProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const isDeleted = isDeletedProp ?? (data !== undefined && 'isDeleted' in data ? data.isDeleted : false);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        editDelete: {
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

  return (
    <View>
      <ListSection>
        <ListSubheader>Visibility</ListSubheader>
      </ListSection>
      {canChangeState && data ? (
        <ModeratorStateView data={data} />
      ) : (
        <PaddedContentView padTop={true}>
          <Text>Content visibility cannot be changed. Objectionable public content should be deleted. Objectional private content cannot be deleted, take action against the creator instead.</Text>
        </PaddedContentView>
      )}
      <View style={styles.editDelete}>
        <PrimaryActionButton
          testID={`${testIDPrefix}Edit-button`}
          buttonText={'Edit'}
          icon={AppIcons.edit}
          buttonColor={theme.colors.twitarrPositiveButton}
          onPress={onEdit ?? (() => {})}
          disabled={!onEdit || isDeleted}
          viewStyle={styles.button}
          style={styles.buttonInner}
        />
        <PrimaryActionButton
          testID={`${testIDPrefix}Delete-button`}
          buttonText={'Delete'}
          icon={AppIcons.delete}
          buttonColor={theme.colors.twitarrNegativeButton}
          onPress={onDelete ?? (() => {})}
          disabled={!onDelete || isDeleted || isDeleting}
          isLoading={isDeleting}
          viewStyle={styles.button}
          style={styles.buttonInner}
        />
      </View>
      {children}
    </View>
  );
};
