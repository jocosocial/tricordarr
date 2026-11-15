import React, {ReactNode} from 'react';
import {Menu} from 'react-native-paper';

import {ReactionMenuItem} from '#src/Components/Menus/Items/ReactionMenuItem';
import {MenuContextBridge, useMenuContextBridge} from '#src/Components/Menus/MenuContextBridge';
import {FezPostReactionPicker} from '#src/Components/Reactions/FezPostReactionPicker';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {useClipboard} from '#src/Hooks/useClipboard';
import {useLazyVisibility} from '#src/Hooks/useLazyVisibility';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {FezData, FezPostData} from '#src/Structs/ControllerStructs';

interface FezPostActionsMenuProps {
  visible: boolean;
  closeMenu: () => void;
  anchor: ReactNode;
  fezPost: FezPostData;
  fez?: FezData;
}

/**
 * Overflow actions for a fez post. `fez` is optional; Report is hidden when it is omitted.
 */
export const FezPostActionsMenu = ({visible, closeMenu, anchor, fezPost, fez}: FezPostActionsMenuProps) => {
  const {setString} = useClipboard();
  const bridged = useMenuContextBridge();
  const commonNavigation = useCommonStack();
  const {hasModerator} = usePrivilege();
  const {currentUserID} = useSession();
  const picker = useLazyVisibility();
  // Swiftarr refuses reactions on your own posts, and without the chat its cache cannot be updated.
  const canReact = !!fez && !!currentUserID && currentUserID !== fezPost.author.userID;

  const handleReport = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.reportScreen, {
      contentType: ReportContentType.fezPost,
      contentID: fezPost.postID,
    });
  };

  return (
    <>
      <Menu visible={visible} onDismiss={closeMenu} anchor={anchor}>
        <MenuContextBridge bridged={bridged}>
          <Menu.Item
            dense={false}
            leadingIcon={AppIcons.copy}
            title={'Copy'}
            onPress={() => {
              setString(fezPost.text);
              closeMenu();
            }}
          />
          <ReactionMenuItem
            disabled={!canReact}
            onPress={() => {
              closeMenu();
              picker.show();
            }}
          />
          {fez && fez.fezType !== FezType.closed && (
            <Menu.Item dense={false} leadingIcon={AppIcons.report} title={'Report'} onPress={handleReport} />
          )}
          {hasModerator && (
            <Menu.Item
              dense={false}
              leadingIcon={AppIcons.moderator}
              title={'Moderate'}
              onPress={() => {
                closeMenu();
                pushModerateResource(commonNavigation, 'fezpost', fezPost.postID.toString());
              }}
            />
          )}
        </MenuContextBridge>
      </Menu>
      {picker.mounted && (
        <FezPostReactionPicker fezPost={fezPost} fez={fez} open={picker.visible} onClose={picker.hide} />
      )}
    </>
  );
};
