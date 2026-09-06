import React from 'react';
import {Text} from 'react-native-paper';

import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';

interface ModerationEdit {
  editID: string;
}

interface ModerationEditListProps<T extends ModerationEdit> {
  edits: T[];
  renderEdit: (edit: T) => React.ReactNode;
  header?: string;
  emptyText?: string;
}

/**
 * Edit-history section on a content moderate screen. Renders a header, an empty message, or one row per edit.
 */
const ModerationEditListInternal = <T extends ModerationEdit>({
  edits,
  renderEdit,
  header = 'Edit History',
  emptyText = 'No previous edits.',
}: ModerationEditListProps<T>) => {
  return (
    <>
      <ListSection>
        <ListSubheader>{header}</ListSubheader>
      </ListSection>
      {edits.length === 0 ? (
        <PaddedContentView padTop={true}>
          <Text>{emptyText}</Text>
        </PaddedContentView>
      ) : (
        edits.map(edit => (
          <PaddedContentView key={edit.editID} padTop={true}>
            {renderEdit(edit)}
          </PaddedContentView>
        ))
      )}
    </>
  );
};

export const ModerationEditList = React.memo(ModerationEditListInternal) as typeof ModerationEditListInternal;
