import React, {memo} from 'react';
import {BoardgameData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {List} from 'react-native-paper';
import {StyleSheet, View, Text} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {MainStackComponents, useMainStack} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {AppIcon} from '../../Icons/AppIcon.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';

interface BoardgameListItemProps {
  boardgame: BoardgameData;
}

const ItemRight = ({boardgame}: BoardgameListItemProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    outerContainer: {
      ...commonStyles.flexRow,
    },
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
    icon: {
      ...commonStyles.paddingLeftSmall,
    },
  });
  const playingTime = BoardgameData.getPlayingTime(boardgame);
  return (
    <View style={styles.outerContainer}>
      <View style={styles.rightContainer}>
        <View style={styles.rightContent}>
          {boardgame.yearPublished && <Text style={styles.text}>{boardgame.yearPublished}</Text>}
          {playingTime && <Text style={styles.text}>{playingTime}</Text>}
        </View>
      </View>
      {boardgame.isFavorite && <AppIcon icon={AppIcons.favorite} style={styles.icon} />}
    </View>
  );
};

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
  });

  const getRight = () => <ItemRight boardgame={boardgame} />;

  const onPress = () =>
    navigation.push(MainStackComponents.boardgameScreen, {
      boardgame: boardgame,
    });

  return (
    <List.Item
      style={styles.item}
      title={boardgame.gameName}
      titleNumberOfLines={0}
      description={BoardgameData.getPlayers(boardgame)}
      descriptionStyle={styles.text}
      titleStyle={styles.text}
      onPress={onPress}
      right={getRight}
    />
  );
};

export const BoardgameListItem = memo(BoardgameListItemInternal);
