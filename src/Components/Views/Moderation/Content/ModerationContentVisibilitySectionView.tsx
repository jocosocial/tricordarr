import React, {PropsWithChildren, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import {ModeratorContentSegmentedButtons} from '#src/Components/Buttons/SegmentedButtons/ModeratorContentSegmentedButtons';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {ModeratorStateView} from '#src/Components/Views/Moderation/ModeratorStateView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ModeratedContentData} from '#src/Libraries/Moderation/ModerationStateContext';

interface ModerationContentVisibilitySectionViewProps extends PropsWithChildren {
  data: ModeratedContentData;
  onEdit: () => void;
  onDelete: () => void;
  testIDPrefix: string;
  isDeleting?: boolean;
}

/**
 * Visibility section on a content moderate screen: current state, edit/delete, then any extra actions.
 */
export const ModerationContentVisibilitySectionView = ({
  data,
  onEdit,
  onDelete,
  testIDPrefix,
  isDeleting,
  children,
}: ModerationContentVisibilitySectionViewProps) => {
  const {commonStyles} = useStyles();
  const isDeleted = 'isDeleted' in data ? data.isDeleted : false;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        editDelete: {
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingBottomSmall,
        },
      }),
    [commonStyles],
  );

  return (
    <View>
      <ListSection>
        <ListSubheader>Visibility</ListSubheader>
      </ListSection>
      <ModeratorStateView data={data} />
      <View style={styles.editDelete}>
        <ModeratorContentSegmentedButtons
          testIDPrefix={testIDPrefix}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
          disabled={isDeleted}
        />
      </View>
      {children}
    </View>
  );
};
