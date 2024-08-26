import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {View} from 'react-native';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {ForumThreadScreenFilterMenu} from '../../Menus/Forum/ForumThreadScreenFilterMenu';
import {ForumThreadScreenSortMenu} from '../../Menus/Forum/ForumThreadScreenSortMenu';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {ForumThreadsRelationsView} from '../../Views/Forum/ForumThreadsRelationsView';
import {ForumThreadsCategoryView} from '../../Views/Forum/ForumThreadsCategoryView';
import {useIsFocused} from '@react-navigation/native';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {AppView} from '../../Views/AppView';
import {ForumFilter} from '../../../libraries/Enums/ForumSortFilter';
import {ForumCategoryScreenActionsMenu} from '../../Menus/Forum/ForumCategoryScreenActionsMenu.tsx';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumCategoryScreen,
  NavigatorIDs.forumStack
>;

export const ForumCategoryScreen = ({route, navigation}: Props) => {
  const {forumFilter} = useFilter();
  const isFocused = useIsFocused();
  const {clearPrivileges} = usePrivilege();

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ForumThreadScreenSortMenu />
          <ForumThreadScreenFilterMenu />
          <ForumCategoryScreenActionsMenu />
        </HeaderButtons>
      </View>
    );
  }, []);

  useEffect(() => {
    // This clears the previous state of forum posts and a specific forum.
    if (isFocused) {
      clearPrivileges();
    }
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [isFocused, getNavButtons, navigation, clearPrivileges]);

  if (forumFilter) {
    return (
      <AppView>
        <ForumThreadsRelationsView
          relationType={ForumFilter.toRelation(forumFilter)}
          categoryID={route.params.categoryID}
        />
      </AppView>
    );
  }
  return (
    <AppView>
      <ForumThreadsCategoryView categoryID={route.params.categoryID} />
    </AppView>
  );
};
