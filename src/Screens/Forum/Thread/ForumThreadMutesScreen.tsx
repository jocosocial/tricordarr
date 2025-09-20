import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator.tsx';
import {View} from 'react-native';
import {MaterialHeaderButton} from '#src/Buttons/MaterialHeaderButton.tsx';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {ForumThreadScreenSortMenu} from '#src/Menus/Forum/ForumThreadScreenSortMenu.tsx';
import {ForumThreadsRelationsView} from '#src/Views/Forum/ForumThreadsRelationsView.tsx';
import {ForumRelationQueryType} from '#src/Queries/Forum/ForumThreadRelationQueries.ts';
import {AppView} from '#src/Views/AppView.tsx';

type Props = NativeStackScreenProps<ForumStackParamList, ForumStackComponents.forumMutesScreen>;

export const ForumThreadMutesScreen = ({navigation}: Props) => {
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
      <ForumThreadsRelationsView relationType={ForumRelationQueryType.mutes} />
    </AppView>
  );
};
