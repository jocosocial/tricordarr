import React from 'react';

import {BaseWarningView} from '#src/Components/Views/Warnings/BaseWarningView';

interface UnsavedChangesWarningViewProps {
  isVisible: boolean;
}

/**
 * React Native Paper has a quirk where if you fill out a form and the keyboard is visible, tapping
 * the button to submit the form dismisses the keyboard. It takes a second press to submit the form.
 * I was worried that users might not realize their form hadn't submitted yet. So this Banner-esque
 * view gets shown if there is unsaved work based on a trigger field in the form <DirtyDetectionField>.
 * This gets cleared in response to navigation events in each Navigator.
 */
export const UnsavedChangesWarningView = ({isVisible = false}: UnsavedChangesWarningViewProps) => {
  return <BaseWarningView variant={'error'} message={'There are unsaved changes.'} visible={isVisible} />;
};
