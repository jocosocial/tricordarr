import React, {ReactNode, useState} from 'react';
import {Menu} from 'react-native-paper';

import {FezPostActionsReactionItem} from '#src/Components/Menus/Fez/Items/FezPostActionsReactionItem';
import {EmojiPickerModal} from '#src/Components/Reactions/EmojiPickerModal';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useClipboard} from '#src/Hooks/useClipboard';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useFezPostReactionMutation} from '#src/Queries/Fez/FezPostReactionMutations';
import {FezData, FezPostData, ReactionData} from '#src/Structs/ControllerStructs';

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
  const {currentUserID} = useSession();
  const commonNavigation = useCommonStack();
  const {hasModerator} = usePrivilege();
  const {updatePostReactions} = useFezCacheReducer();
  const reactionMutation = useFezPostReactionMutation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const bySelf = currentUserID === fezPost.author.userID;

  const handleReport = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.reportScreen, {
      contentType: ReportContentType.fezPost,
      contentID: fezPost.postID,
    });
  };

  /** Adds or removes the selected reaction and applies the returned post to the chat cache. */
  const handleReaction = (reaction: string) => {
    if (!fez || !currentUserID) {
      return;
    }
    const action = ReactionData.hasUserReacted(fezPost.reactions ?? [], currentUserID, reaction) ? 'delete' : 'create';
    reactionMutation.mutate(
      {fezPostID: fezPost.postID.toString(), reaction, action},
      {onSuccess: response => updatePostReactions(fez.fezID, response.data.postID, response.data.reactions)},
    );
  };

  return (
    <>
      <Menu visible={visible} onDismiss={closeMenu} anchor={anchor}>
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
          disabled={!fez || bySelf || reactionMutation.isPending}
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
      </Menu>
      <EmojiPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onEmojiSelected={handleReaction} />
    </>
  );
};
