import React from 'react';
import {Text} from 'react-native-paper';

import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ModerationContentPreview} from '#src/Components/Views/Moderation/ModerationContentPreview';
import {PostEditLogData} from '#src/Structs/ControllerStructs';

interface ModerationPostEditListProps {
  edits: PostEditLogData[];
}

/**
 * Previous text/image states of a twarrt or forum post.
 */
export const ModerationPostEditList = ({edits}: ModerationPostEditListProps) => {
  if (edits.length === 0) {
    return (
      <PaddedContentView padTop={true}>
        <Text>No previous edits.</Text>
      </PaddedContentView>
    );
  }

  return (
    <>
      <ListSection>
        <ListSubheader>Edit History</ListSubheader>
      </ListSection>
      {edits.map(edit => (
        <PaddedContentView key={edit.editID} padTop={true}>
          <ModerationContentPreview
            author={edit.author}
            timestamp={edit.createdAt}
            text={edit.text}
            images={edit.images}
          />
        </PaddedContentView>
      ))}
    </>
  );
};
