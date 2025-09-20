import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {useAppTheme} from '../../../Styles/Theme.ts';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {View} from 'react-native';
import {ModalCard} from '../../Cards/ModalCard.tsx';
import React from 'react';
import {ForumData, PostData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {useForumPostDeleteMutation} from '../../Queries/Forum/ForumPostMutations.ts';
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
