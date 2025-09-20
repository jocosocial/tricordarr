import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator';
import {View} from 'react-native';
import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {ForumThreadScreenSortMenu} from '#src/Components/Menus/Forum/ForumThreadScreenSortMenu';
import {ForumThreadsRelationsView} from '#src/Components/Views/Forum/ForumThreadsRelationsView';
import {ForumRelationQueryType} from '#src/Queries/Forum/ForumThreadRelationQueries';
import {AppView} from '#src/Components/Views/AppView';

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
