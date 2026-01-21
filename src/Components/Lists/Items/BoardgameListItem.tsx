import React, {memo, useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {List} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {BoardgameListItemSwipeable} from '#src/Components/Swipeables/BoardgameListItemSwipeable';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/MainStackNavigator';
import {BoardgameData} from '#src/Structs/ControllerStructs';

interface BoardgameListItemProps {
  boardgame: BoardgameData;
}

const ItemRightInternal = ({boardgame}: BoardgameListItemProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();

  const styles = StyleSheet.create({
    rightContainer: {
      ...commonStyles.marginLeftSmall,
    },
    rightContent: {
      ...commonStyles.flexColumn,
      ...commonStyles.alignItemsEnd,
    },
    text: {
      ...commonStyles.onBackground,
    },
  });

  return (
    <View style={styles.rightContainer}>
      <View style={styles.rightContent}>
        {boardgame.isFavorite && <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />}
        {boardgame.yearPublished && <Text style={styles.text}>{boardgame.yearPublished}</Text>}
      </View>
    </View>
  );
};

const ItemLeftInternal = (_: BoardgameListItemProps) => {
  return <></>;
};

const ItemLeft = memo(ItemLeftInternal);
const ItemRight = memo(ItemRightInternal);

const BoardgameListItemInternal = ({boardgame}: BoardgameListItemProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const navigation = useMainStack();

  const styles = StyleSheet.create({
    item: {
      backgroundColor: theme.colors.background,
      ...commonStyles.paddingHorizontalSmall,
    },
    text: {
      ...commonStyles.onBackground,
    },
    title: {
      ...commonStyles.onBackground,
      fontWeight: 'bold',
    },
    content: {
      ...commonStyles.paddingLeftZero,
    },
  });

  const getRight = useCallback(() => <ItemRight boardgame={boardgame} />, [boardgame]);
  const getLeft = useCallback(() => <ItemLeft boardgame={boardgame} />, [boardgame]);

  const onPress = useCallback(
    () =>
      navigation.push(MainStackComponents.boardgameScreen, {
        boardgame: boardgame,
      }),
    [navigation, boardgame],
  );

  const players = BoardgameData.getPlayers(boardgame);
  const playingTime = BoardgameData.getPlayingTime(boardgame);
  const description = [players, playingTime].filter(Boolean).join('\n');

  return (
    <BoardgameListItemSwipeable boardgame={boardgame}>
      <List.Item
        contentStyle={styles.content}
        style={styles.item}
        title={boardgame.gameName}
        titleNumberOfLines={0}
        description={description}
        descriptionStyle={styles.text}
        titleStyle={styles.title}
        onPress={onPress}
        right={getRight}
        left={getLeft}
      />
    </BoardgameListItemSwipeable>
  );
};

export const BoardgameListItem = memo(BoardgameListItemInternal);
