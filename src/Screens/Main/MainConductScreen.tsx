import React from 'react';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConductQuery} from '#src/Queries/PublicQueries';
import {RefreshControl} from 'react-native';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ContentText} from '#src/Components/Text/ContentText';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';

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
