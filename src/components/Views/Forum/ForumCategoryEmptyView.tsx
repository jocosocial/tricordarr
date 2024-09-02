import {RefreshControl, View} from 'react-native';
import {ScrollingContentView} from '../Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../Content/PaddedContentView.tsx';
import {Text} from 'react-native-paper';
import {ForumCategoryFAB} from '../../Buttons/FloatingActionButtons/ForumCategoryFAB.tsx';
import React from 'react';

interface ForumCategoryEmptyViewProps {
  refreshing: boolean;
  onRefresh: () => void;
  categoryID?: string;
  showFAB: boolean;
}

export const ForumCategoryEmptyView = ({refreshing, onRefresh, showFAB, categoryID}: ForumCategoryEmptyViewProps) => {
  return (
    <>
      <View>
        <ScrollingContentView
          isStack={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <PaddedContentView padTop={true}>
            <Text>There aren't any forums in this category yet.</Text>
          </PaddedContentView>
        </ScrollingContentView>
      </View>
      {showFAB && categoryID && <ForumCategoryFAB categoryId={categoryID} />}
    </>
  );
};
