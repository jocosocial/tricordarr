import React from 'react';
import {AppView} from '#src/Views/AppView.tsx';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {useConductQuery} from '#src/Queries/PublicQueries.ts';
import {RefreshControl} from 'react-native';
import {LoadingView} from '#src/Views/Static/LoadingView.tsx';
import {ContentText} from '#src/Text/ContentText.tsx';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView.tsx';

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
