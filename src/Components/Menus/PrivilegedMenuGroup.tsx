import React from 'react';
import {Divider} from 'react-native-paper';

interface PrivilegedMenuGroupProps {
  children?: React.ReactNode;
  /**
   * Whether a divider precedes the group. Set false when the group is the first thing in the menu.
   */
  leadingDivider?: boolean;
  /**
   * Whether a divider follows the group. Set false when the group is the last thing in the menu so
   * the menu doesn't end on a dangling divider.
   */
  trailingDivider?: boolean;
}

/**
 * Groups role-gated menu items (moderator, Twitarr Team, shutternaut, etc.) between bold dividers.
 * Renders nothing when every child is gated off, so users without the role never see an empty or
 * doubled divider. Gate each item on its role at the call site; an item component that renders
 * null for itself is not detected here.
 */
export const PrivilegedMenuGroup = ({
  children,
  leadingDivider = true,
  trailingDivider = true,
}: PrivilegedMenuGroupProps) => {
  if (React.Children.toArray(children).length === 0) {
    return null;
  }
  return (
    <>
      {leadingDivider && <Divider bold={true} />}
      {children}
      {trailingDivider && <Divider bold={true} />}
    </>
  );
};
