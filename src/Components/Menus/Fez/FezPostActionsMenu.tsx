import {useQueryClient} from '@tanstack/react-query';
import React, {ReactNode, useState} from 'react';
import {Menu} from 'react-native-paper';

import {FezPostActionsReactionItem} from '#src/Components/Menus/Fez/Items/FezPostActionsReactionItem';
import {EmojiPickerModal} from '#src/Components/Reactions/EmojiPickerModal';
import {ReportModalView} from '#src/Components/Views/Modals/ReportModalView';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {useClipboard} from '#src/Hooks/useClipboard';
import {useFezPostReactionMutation} from '#src/Queries/Fez/FezPostReactionMutations';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezData, FezPostData, ReactionData} from '#src/Structs/ControllerStructs';

interface FezPostActionsMenuProps {
  visible: boolean;
  closeMenu: () => void;
  anchor: ReactNode;
  fezPost: FezPostData;
  fez: FezData;
}

export const FezPostActionsMenu = ({visible, closeMenu, anchor, fezPost, fez}: FezPostActionsMenuProps) => {
  const {setModalContent, setModalVisible} = useModal();
  const {setString} = useClipboard();
  const queryClient = useQueryClient();
  const reactionMutation = useFezPostReactionMutation();
  const {data: profilePublicData} = useUserProfileQuery();
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleReport = () => {
    closeMenu();
    setModalContent(<ReportModalView fezPost={fezPost} />);
    setModalVisible(true);
  };

  const handleReaction = (emoji: string) => {
    if (!profilePublicData) {
      return;
    }
    const action = ReactionData.hasUserReacted(fezPost.reactions ?? [], profilePublicData.header.userID, emoji)
      ? 'delete'
      : 'create';
    reactionMutation.mutate(
      {fezPostID: fezPost.postID.toString(), emoji, action},
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({queryKey: [`/fez/${fez.fezID}`]});
        },
      },
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
          disabled={reactionMutation.isPending}
          onPress={() => {
            closeMenu();
            setPickerOpen(true);
          }}
        />
        {fez && fez.fezType !== FezType.closed && (
          <Menu.Item dense={false} leadingIcon={AppIcons.report} title={'Report'} onPress={handleReport} />
        )}
      </Menu>
      <EmojiPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onEmojiSelected={handleReaction} />
    </>
  );
};
