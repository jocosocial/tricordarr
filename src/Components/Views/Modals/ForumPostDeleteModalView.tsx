import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ModalCard} from '#src/Components/Cards/ModalCard';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useForumPostDeleteMutation} from '#src/Queries/Forum/ForumPostMutations';
import {ForumData, PostData} from '#src/Structs/ControllerStructs';

const ModalContent = () => {
  const {commonStyles} = useStyles();
  return (
    <>
      <Text style={[commonStyles.marginBottomSmall]}>Confirm delete forum post? There is no recovery.</Text>
    </>
  );
};

interface Props {
  postData: PostData;
  forumData?: ForumData;
}

export const ForumPostDeleteModalView = ({postData, forumData}: Props) => {
  const {setModalVisible} = useModal();
  const {theme} = useAppTheme();
  const deleteMutation = useForumPostDeleteMutation();
  const {deletePost} = useForumCacheReducer();

  const onSubmit = () => {
    deleteMutation.mutate(
      {
        postID: postData.postID.toString(),
      },
      {
        onSuccess: () => {
          deletePost(postData.postID, forumData?.forumID, forumData?.categoryID);
          setModalVisible(false);
        },
      },
    );
  };

  const cardActions = (
    <PrimaryActionButton
      buttonColor={theme.colors.twitarrNegativeButton}
      buttonText={'Delete'}
      onPress={onSubmit}
      isLoading={deleteMutation.isPending}
      disabled={deleteMutation.isPending}
    />
  );

  return (
    <View>
      <ModalCard title={'Delete Post'} closeButtonText={'Close'} content={<ModalContent />} actions={cardActions} />
    </View>
  );
};
