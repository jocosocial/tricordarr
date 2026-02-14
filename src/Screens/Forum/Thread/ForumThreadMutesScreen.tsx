import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {ForumSelectionHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ForumSelectionHeaderButtons';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ForumThreadScreenSortMenu} from '#src/Components/Menus/Forum/ForumThreadScreenSortMenu';
import {AppView} from '#src/Components/Views/AppView';
import {ForumThreadsRelationsView} from '#src/Components/Views/Forum/ForumThreadsRelationsView';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {SelectionProvider} from '#src/Context/Providers/SelectionProvider';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator';
import {ForumRelationQueryType} from '#src/Queries/Forum/ForumThreadRelationQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ForumListData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<ForumStackParamList, ForumStackComponents.forumMutesScreen>;

export const ForumThreadMutesScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.forumCategoryHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.forums} urlPath={'/forum/mutes'}>
          <SelectionProvider>
            <ForumThreadMutesScreenInner {...props} />
          </SelectionProvider>
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const ForumThreadMutesScreenInner = ({navigation}: Props) => {
  const [forumListData, setForumListData] = useState<ForumListData[]>([]);
  const {setRefreshing} = useRefresh({});
  const {selectedItems, enableSelection} = useSelection();

  const getNavButtons = useCallback(() => {
    if (enableSelection) {
      return (
        <View>
          <ForumSelectionHeaderButtons
            setRefreshing={setRefreshing}
            categoryID={undefined}
            items={forumListData}
            selectedItems={selectedItems}
          />
        </View>
      );
    }
    return (
      <View>
        <MaterialHeaderButtons>
          <ForumThreadScreenSortMenu />
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.forumCategoryHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [enableSelection, forumListData, selectedItems, navigation, setRefreshing]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
      title: enableSelection ? `Selected: ${selectedItems.length}` : 'Muted Forums',
    });
  }, [getNavButtons, navigation, enableSelection, selectedItems.length]);

  return (
    <AppView>
      <ForumThreadsRelationsView relationType={ForumRelationQueryType.mutes} onDataChange={setForumListData} />
    </AppView>
  );
};
