import React from 'react';

import {NavigationListItem} from '#src/Components/Lists/Items/NavigationListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {CheckpointPreview} from '#src/Enums/CheckpointPreview';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';

/**
 * Developer index of every checkpoint in `src/Screens/Checkpoint`, linking to a preview of the
 * view each one renders when it blocks. Saves having to arrange the account state (logged out,
 * pre-registration, disabled feature, missing role) that would normally trigger them.
 */
export const CheckpointSettingScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSection>
          {CheckpointPreview.getAll().map(preview => (
            <NavigationListItem
              key={preview}
              title={CheckpointPreview.getTitle(preview)}
              description={CheckpointPreview.getDescription(preview)}
              navComponent={SettingsStackScreenComponents.checkpointPreviewSettingScreen}
              params={{preview: preview}}
            />
          ))}
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
