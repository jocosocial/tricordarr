import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {useConductQuery} from '../../Queries/PublicQueries.ts';
import {RefreshControl} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {ContentText} from '../../Text/ContentText.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';

export const MainConductScreen = () => {
  const {data, refetch, isFetching} = useConductQuery();
  if (!data) {
    return <LoadingView />;
  }
  return (
    <AppView>
      <ScrollingContentView
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        isStack={true}>
        <PaddedContentView>
          <ContentText text={data} forceMarkdown={true} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
