import React, {useState} from 'react';
import {AppView} from '../../Views/AppView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {RefreshControl} from 'react-native';
import {SeamailSearchBar} from '../../Search/SeamailSearchBar';

export const SeamailSearchScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} enabled={false} />}>
        <PaddedContentView padSides={false}>
          <SeamailSearchBar setIsLoading={setRefreshing} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
