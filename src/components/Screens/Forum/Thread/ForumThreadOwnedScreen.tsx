import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, NavigatorIDs} from '../../../../libraries/Enums/Navigation';
import {ForumStackParamList} from '../../../Navigation/Stacks/ForumStackNavigator';
import {View} from 'react-native';
import {MaterialHeaderButton} from '../../../Buttons/MaterialHeaderButton';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {ForumThreadSortMenu} from '../../../Menus/Forum/ForumThreadSortMenu';
import {ForumThreadsRelationsView} from '../../../Views/Forum/ForumThreadsRelationsView';
import {ForumFilter} from '../../../../libraries/Enums/ForumSortFilter';
import {ForumRelationQueryType} from '../../../Queries/Forum/ForumRelationQueries';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumOwnedScreen,
  NavigatorIDs.forumStack
>;

export const ForumThreadOwnedScreen = ({navigation}: Props) => {
  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ForumThreadSortMenu />
        </HeaderButtons>
      </View>
    );
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return <ForumThreadsRelationsView relationType={ForumRelationQueryType.owner} />;
};
