import React, {memo, useCallback} from 'react';
import {BoardgameData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {List} from 'react-native-paper';
import {StyleSheet, View, Text} from 'react-native';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {MainStackComponents, useMainStack} from '#src/Components/Navigation/Stacks/MainStackNavigator.tsx';
import {AppIcon} from '#src/Components/Icons/AppIcon.tsx';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';

interface BoardgameListItemProps {
  boardgame: BoardgameData;
}

const ItemRightInternal = ({boardgame}: BoardgameListItemProps) => {
  const {commonStyles} = useStyles();

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

  const playingTime = BoardgameData.getPlayingTime(boardgame);
  return (
    <View style={styles.rightContainer}>
      <View style={styles.rightContent}>
        {boardgame.yearPublished && <Text style={styles.text}>{boardgame.yearPublished}</Text>}
        {playingTime && <Text style={styles.text}>{playingTime}</Text>}
      </View>
    </View>
  );
};

const ItemLeftInternal = ({boardgame}: BoardgameListItemProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    leftContainer: {
      ...commonStyles.justifyCenter,
      ...commonStyles.paddingRightSmall,
    },
    leftContent: {
      ...commonStyles.flexColumn,
    },
    text: {
      ...commonStyles.onBackground,
    },
  });

  if (!boardgame.isFavorite) {
    return <></>;
  }

  return (
    <View style={styles.leftContainer}>
      <View style={styles.leftContent}>
        <AppIcon icon={AppIcons.favorite} />
      </View>
    </View>
  );
};

const ItemLeft = memo(ItemLeftInternal);
const ItemRight = memo(ItemRightInternal);

const BoardgameListItemInternal = ({boardgame}: BoardgameListItemProps) => {
  const {commonStyles} = useStyles();
  const navigation = useMainStack();

  const styles = StyleSheet.create({
    item: {
      ...commonStyles.paddingHorizontal,
    },
    text: {
      ...commonStyles.onBackground,
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

  return (
    <List.Item
      contentStyle={styles.content}
      style={styles.item}
      title={boardgame.gameName}
      titleNumberOfLines={0}
      description={BoardgameData.getPlayers(boardgame)}
      descriptionStyle={styles.text}
      titleStyle={styles.text}
      onPress={onPress}
      right={getRight}
      left={getLeft}
    />
  );
};

export const BoardgameListItem = memo(BoardgameListItemInternal);
