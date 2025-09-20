import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, ForumStackParamList} from '../../../Navigation/Stacks/ForumStackNavigator.tsx';
import {View} from 'react-native';
import {MaterialHeaderButton} from '../../../Buttons/MaterialHeaderButton.tsx';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {ForumThreadScreenSortMenu} from '../../../Menus/Forum/ForumThreadScreenSortMenu.tsx';
import {ForumThreadsRelationsView} from '../../../Views/Forum/ForumThreadsRelationsView.tsx';
import {ForumRelationQueryType} from '../../../Queries/Forum/ForumThreadRelationQueries.ts';
import {AppView} from '../../../Views/AppView.tsx';

type Props = NativeStackScreenProps<ForumStackParamList, ForumStackComponents.forumFavoritesScreen>;

export const ForumThreadFavoritesScreen = ({navigation}: Props) => {
  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ForumThreadScreenSortMenu />
        </HeaderButtons>
      </View>
    );
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <AppView>
      <ForumThreadsRelationsView relationType={ForumRelationQueryType.favorites} />
    </AppView>
  );
};
