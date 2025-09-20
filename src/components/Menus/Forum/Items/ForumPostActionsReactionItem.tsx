import {useForumPostReactionMutation} from '../../../Queries/Forum/ForumPostBookmarkMutations.ts';
import {PostData, PostDetailData} from '../../../../Libraries/Structs/ControllerStructs.tsx';
import {LikeType} from '../../../../Libraries/Enums/LikeType.ts';
import {ActivityIndicator, Text} from 'react-native-paper';
import {LaughReaction, LoveReaction, LikeReaction} from '../../../Text/Reactions.tsx';
import {StyleSheet, View} from 'react-native';
import React from 'react';
import {useStyles} from '../../../Context/Contexts/StyleContext.ts';
import {useForumPostQuery} from '../../../Queries/Forum/ForumPostQueries.ts';
import {SubmitIconButton} from '../../../Buttons/IconButtons/SubmitIconButton.tsx';
import {useAppTheme} from '../../../../Styles/Theme.ts';
import {useUserProfileQuery} from '../../../Queries/User/UserQueries.ts';

interface ForumPostActionsReactionItemProps {
  forumPost: PostData;
}

export const ForumPostActionsReactionItem = ({forumPost}: ForumPostActionsReactionItemProps) => {
  const reactionMutation = useForumPostReactionMutation();
  const {commonStyles} = useStyles();
  const {data: profilePublicData} = useUserProfileQuery();
  const bySelf = profilePublicData?.header.userID === forumPost.author.userID;
  const {data, isLoading, refetch} = useForumPostQuery(forumPost.postID.toString());
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    view: {
      ...commonStyles.flexRow,
      ...commonStyles.alignItemsCenter,
    },
    text: {
      ...commonStyles.marginRightSmall,
    },
  });

  if (isLoading || !data || !profilePublicData) {
    return (
      <View style={styles.view}>
        <ActivityIndicator />
      </View>
    );
  }

  const handleReaction = (newReaction: LikeType) => {
    let hasReacted = false;
    switch (newReaction) {
      case LikeType.like:
        hasReacted = PostDetailData.hasUserReacted(data, profilePublicData.header, LikeType.like);
        break;
      case LikeType.laugh:
        hasReacted = PostDetailData.hasUserReacted(data, profilePublicData.header, LikeType.laugh);
        break;
      case LikeType.love:
        hasReacted = PostDetailData.hasUserReacted(data, profilePublicData.header, LikeType.love);
        break;
    }
    const action = hasReacted ? 'delete' : 'create';
    reactionMutation.mutate(
      {
        postID: forumPost.postID.toString(),
        reaction: newReaction,
        action: action,
      },
      {
        onSuccess: () => {
          // @TODO this is a hack but processing all these static fields and types sucks.
          refetch();
        },
      },
    );
  };

  return (
    <View style={styles.view}>
      <SubmitIconButton
        icon={LikeReaction}
        onPress={() => handleReaction(LikeType.like)}
        submitting={reactionMutation.isLoading}
        disabled={bySelf}
        containerColor={
          PostDetailData.hasUserReacted(data, profilePublicData.header, LikeType.like)
            ? theme.colors.secondaryContainer
            : undefined
        }
      />
      <Text style={styles.text}>{data.likes.length}</Text>
      <SubmitIconButton
        icon={LaughReaction}
        onPress={() => handleReaction(LikeType.laugh)}
        submitting={reactionMutation.isLoading}
        disabled={bySelf}
        containerColor={
          PostDetailData.hasUserReacted(data, profilePublicData.header, LikeType.laugh)
            ? theme.colors.secondaryContainer
            : undefined
        }
      />
      <Text style={styles.text}>{data.laughs.length}</Text>
      <SubmitIconButton
        icon={LoveReaction}
        onPress={() => handleReaction(LikeType.love)}
        submitting={reactionMutation.isLoading}
        disabled={bySelf}
        containerColor={
          PostDetailData.hasUserReacted(data, profilePublicData.header, LikeType.love)
            ? theme.colors.secondaryContainer
            : undefined
        }
      />
      <Text style={styles.text}>{data.loves.length}</Text>
    </View>
  );
};
