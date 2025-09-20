import {useModal} from '#src/Context/Contexts/ModalContext';
import {useAppTheme} from '#src/Styles/Theme';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {View} from 'react-native';
import {ModalCard} from '#src/Components/Cards/ModalCard';
import React from 'react';
import {ForumData, PostData} from '#src/Structs/ControllerStructs';
import {Text} from 'react-native-paper';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useForumPostDeleteMutation} from '#src/Queries/Forum/ForumPostMutations';
import {useQueryClient} from '@tanstack/react-query';

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
  const theme = useAppTheme();
  const deleteMutation = useForumPostDeleteMutation();
  const queryClient = useQueryClient();

  const onSubmit = () => {
    deleteMutation.mutate(
      {
        postID: postData.postID.toString(),
      },
      {
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries([`/forum/post/${postData.postID}`]),
            queryClient.invalidateQueries(['/forum/post/search']),
            queryClient.invalidateQueries([`/forum/post/${postData.postID}/forum`]),
          ]);
          if (forumData) {
            await Promise.all([
              queryClient.invalidateQueries([`/forum/${forumData.forumID}`]),
              queryClient.invalidateQueries([`/forum/${forumData.forumID}/pinnedposts`]),
            ]);
          }
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
      isLoading={deleteMutation.isLoading}
      disabled={deleteMutation.isLoading}
    />
  );

  return (
    <View>
      <ModalCard title={'Delete Post'} closeButtonText={'Close'} content={<ModalContent />} actions={cardActions} />
    </View>
  );
};
