import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {View} from 'react-native';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {ForumThreadFilterMenu} from '../../Menus/Forum/ForumThreadFilterMenu';
import {ForumThreadSortMenu} from '../../Menus/Forum/ForumThreadSortMenu';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {ForumCategoryRelationsView} from '../../Views/Forum/ForumCategoryRelationsView';
import {ForumCategoryBaseView} from '../../Views/Forum/ForumCategoryBaseView';
import {useModal} from '../../Context/Contexts/ModalContext';
import {HelpModalView} from '../../Views/Modals/HelpModalView';
import {useIsFocused} from '@react-navigation/native';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {ForumPostListActions} from '../../Reducers/Forum/ForumPostListReducer';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumCategoryScreen,
  NavigatorIDs.forumStack
>;

const helpText = [
  'Muted forums appear at the end of this list.',
  'Favorited forums appear in the sort order, which by default is Most Recent Post first.',
];

export const ForumCategoryScreen = ({route, navigation}: Props) => {
  const {forumFilter} = useFilter();
  const {setModalVisible, setModalContent} = useModal();
  const isFocused = useIsFocused();
  const {dispatchForumPosts, setForumData} = useTwitarr();

  const handleHelp = useCallback(() => {
    setModalContent(<HelpModalView text={helpText} />);
    setModalVisible(true);
  }, [setModalContent, setModalVisible]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ForumThreadSortMenu />
          <ForumThreadFilterMenu />
          <Item title={'Help'} iconName={AppIcons.help} onPress={handleHelp} />
        </HeaderButtons>
      </View>
    );
  }, [handleHelp]);

  useEffect(() => {
    // This clears the previous state of forum posts and a specific forum.
    if (isFocused) {
      dispatchForumPosts({
        type: ForumPostListActions.clear,
      });
      setForumData(undefined);
    }
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [isFocused, getNavButtons, navigation, dispatchForumPosts, setForumData]);

  if (forumFilter) {
    return <ForumCategoryRelationsView forumFilter={forumFilter} categoryId={route.params.categoryId} />;
  }
  return <ForumCategoryBaseView categoryId={route.params.categoryId} />;
};
