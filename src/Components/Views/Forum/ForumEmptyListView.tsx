import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';

interface ForumEmptyListViewProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export const ForumEmptyListView = ({refreshing, onRefresh}: ForumEmptyListViewProps) => {
  return (
    <View>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <Text>No threads to display.</Text>
        </PaddedContentView>
      </ScrollingContentView>
    </View>
  );
};
