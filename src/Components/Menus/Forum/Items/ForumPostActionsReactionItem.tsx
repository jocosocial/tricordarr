import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';

import {SubmitIconButton} from '#src/Components/Buttons/IconButtons/SubmitIconButton';
import {LaughReaction, LikeReaction, LoveReaction} from '#src/Components/Text/Reactions';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {LikeType} from '#src/Enums/LikeType';
import {useForumPostReactionMutation} from '#src/Queries/Forum/ForumPostBookmarkMutations';
import {useForumPostQuery} from '#src/Queries/Forum/ForumPostQueries';
import {PostData, PostDetailData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsReactionItemProps {
  forumPost: PostData;
}

export const ForumPostActionsReactionItem = ({forumPost}: ForumPostActionsReactionItemProps) => {
  const reactionMutation = useForumPostReactionMutation();
  const {commonStyles} = useStyles();
  const {currentUserID} = useSession();
  const bySelf = currentUserID === forumPost.author.userID;
  const {data, isLoading, refetch} = useForumPostQuery(forumPost.postID.toString());
  const {theme} = useAppTheme();

  const styles = StyleSheet.create({
    view: {
      ...commonStyles.flexRow,
      ...commonStyles.alignItemsCenter,
    },
    text: {
      ...commonStyles.marginRightSmall,
    },
  });

  if (isLoading || !data) {
    return (
      <View style={styles.view}>
        <ActivityIndicator />
      </View>
    );
  }

  const handleReaction = (newReaction: LikeType) => {
    const userID = currentUserID ?? '';
    let hasReacted = false;
    switch (newReaction) {
      case LikeType.like:
        hasReacted = PostDetailData.hasUserReacted(data, userID, LikeType.like);
        break;
      case LikeType.laugh:
        hasReacted = PostDetailData.hasUserReacted(data, userID, LikeType.laugh);
        break;
      case LikeType.love:
        hasReacted = PostDetailData.hasUserReacted(data, userID, LikeType.love);
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
        submitting={reactionMutation.isPending}
        disabled={bySelf}
        containerColor={
          currentUserID != null && PostDetailData.hasUserReacted(data, currentUserID, LikeType.like)
            ? theme.colors.secondaryContainer
            : undefined
        }
      />
      <Text style={styles.text}>{data.likes.length}</Text>
      <SubmitIconButton
        icon={LaughReaction}
        onPress={() => handleReaction(LikeType.laugh)}
        submitting={reactionMutation.isPending}
        disabled={bySelf}
        containerColor={
          currentUserID != null && PostDetailData.hasUserReacted(data, currentUserID, LikeType.laugh)
            ? theme.colors.secondaryContainer
            : undefined
        }
      />
      <Text style={styles.text}>{data.laughs.length}</Text>
      <SubmitIconButton
        icon={LoveReaction}
        onPress={() => handleReaction(LikeType.love)}
        submitting={reactionMutation.isPending}
        disabled={bySelf}
        containerColor={
          currentUserID != null && PostDetailData.hasUserReacted(data, currentUserID, LikeType.love)
            ? theme.colors.secondaryContainer
            : undefined
        }
      />
      <Text style={styles.text}>{data.loves.length}</Text>
    </View>
  );
};
