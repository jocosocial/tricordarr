import React from 'react';
import {List, Text} from 'react-native-paper';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {FezAvatarImage} from '../../Images/FezAvatarImage';
import {commonStyles} from '../../../styles';
import {SeamailTimeBadge} from '../../Text/SeamailTimeBadge';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useSeamailStack} from '../../Navigation/Stacks/SeamailStack';
import {CategoryData, FezData} from '../../../libraries/Structs/ControllerStructs';
import {StyleSheet} from 'react-native';
import {ContentText} from '../../Text/ContentText';

interface ForumCategoryListItemProps {
  category: CategoryData;
}

export const ForumCategoryListItem = ({category}: ForumCategoryListItemProps) => {
  // const {profilePublicData} = useUserData();
  // const navigation = useSeamailStack();
  // let badgeCount = 0;
  // if (fez.members) {
  //   badgeCount = fez.members.postCount - fez.members.readCount;
  // }
  //
  const styles = StyleSheet.create({
    item: commonStyles.paddingHorizontal,
    title: commonStyles.bold,
  });
  //
  // const otherParticipants = fez.members?.participants.filter(p => p.userID !== profilePublicData?.header.userID) || [];
  // const description = otherParticipants.map(p => p.username).join(', ');
  //
  // const getAvatar = () => <FezAvatarImage fez={fez} />;
  // const onPress = () =>
  //   navigation.push(SeamailStackScreenComponents.seamailScreen, {
  //     title: fez.title,
  //     fezID: fez.fezID,
  //   });
  // const getTimeBadge = () => <SeamailTimeBadge date={fez.lastModificationTime} badgeCount={badgeCount} />;
  const getThreadCount = () => <Text>{category.numThreads} threads</Text>;
  const getDescription = () => <ContentText textVariant={'bodyMedium'} text={category.purpose} />;

  const onPress = () => console.log('foo');

  return (
    <List.Item
      style={styles.item}
      title={category.title}
      titleStyle={styles.title}
      description={getDescription}
      onPress={onPress}
      right={getThreadCount}
    />
  );
};
