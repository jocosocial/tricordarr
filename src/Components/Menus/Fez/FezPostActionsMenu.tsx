import React, {ReactNode, useState} from 'react';
import {Menu} from 'react-native-paper';

import {FezPostActionsReactionItem} from '#src/Components/Menus/Fez/Items/FezPostActionsReactionItem';
import {MenuContextBridge, useMenuContextBridge} from '#src/Components/Menus/MenuContextBridge';
import {EmojiPickerModal} from '#src/Components/Reactions/EmojiPickerModal';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {useFezPostReaction} from '#src/Hooks/Fez/useFezPostReaction';
import {useClipboard} from '#src/Hooks/useClipboard';
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
  const {addReaction, canReact, isPending} = useFezPostReaction(fezPost, fez);
  const [pickerOpen, setPickerOpen] = useState(false);

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
          <FezPostActionsReactionItem
            disabled={!canReact || isPending}
            onPress={() => {
              closeMenu();
              setPickerOpen(true);
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
      <EmojiPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onEmojiSelected={addReaction} />
    </>
  );
};
