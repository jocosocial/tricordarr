import React from 'react';

import {SubmitIconButton} from '#src/Components/Buttons/IconButtons/SubmitIconButton';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const SubmitButtonHelpTopicView = () => {
  return (
    <HelpTopicView
      title={'Submit'}
      right={<SubmitIconButton onPress={() => {}} disabled={false} withPrivilegeColors={true} />}>
      Submit your post. The button is disabled until your post contains valid content. If you're posting as a privileged
      user, the button will be colored accordingly.
    </HelpTopicView>
  );
};
