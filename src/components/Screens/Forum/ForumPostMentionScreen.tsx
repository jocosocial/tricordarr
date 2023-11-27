import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useForumPostSearchQuery} from '../../Queries/Forum/ForumSearchQueries';
import {RefreshControl, View} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {ForumPostListActions} from '../../Reducers/Forum/ForumPostListReducer';
import {ForumPostListItem} from '../../Lists/Items/Forum/ForumPostListItem';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useModal} from '../../Context/Contexts/ModalContext';
import {HelpModalView} from '../../Views/Modals/HelpModalView';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {ForumCategoryFAB} from '../../Buttons/FloatingActionButtons/ForumCategoryFAB';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumPostMentionScreen,
  NavigatorIDs.forumStack
>;

const helpText = [
  'Long-press a post to favorite, edit, or add a reaction.',
  'Tapping on a post will take you to the posts forum to see it in context.',
  'Favoriting a post will save it to an easily accessible Personal Category on the Forums page.',
  'You can edit or delete your own forum posts.',
];

export const ForumPostMentionScreen = ({navigation}: Props) => {
  const {data, refetch} = useForumPostSearchQuery({mentionself: true});
  const [refreshing, setRefreshing] = useState(false);
  const {forumPosts, dispatchForumPosts} = useTwitarr();
  const {userNotificationData, refetchUserNotificationData} = useUserNotificationData();
  const {setModalContent, setModalVisible} = useModal();

  const handleHelpModal = () => {
    setModalContent(<HelpModalView text={helpText} />);
    setModalVisible(true);
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item title={'Help'} iconName={AppIcons.help} onPress={handleHelpModal} />
        </HeaderButtons>
      </View>
    );
  }, [handleHelpModal]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  useEffect(() => {
    if (userNotificationData?.newForumMentionCount) {
      onRefresh();
    }
  }, [onRefresh, userNotificationData?.newForumMentionCount]);

  useEffect(() => {
    if (data) {
      dispatchForumPosts({
        type: ForumPostListActions.setList,
        postList: data.pages.flatMap(p => p.posts),
      });
    }
    if (userNotificationData?.newForumMentionCount) {
      refetchUserNotificationData();
    }
  }, [data, dispatchForumPosts, refetchUserNotificationData, userNotificationData?.newForumMentionCount]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {forumPosts.map((fp, index) => {
          return (
            <PaddedContentView key={index} padBottom={true}>
              <ForumPostListItem postData={fp} />
            </PaddedContentView>
          );
        })}
      </ScrollingContentView>
      <ForumCategoryFAB />
    </AppView>
  );
};
