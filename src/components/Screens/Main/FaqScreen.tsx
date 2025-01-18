import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useFaqQuery} from '../../Queries/PublicQueries';
import {RefreshControl} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView';
import {ContentText} from '../../Text/ContentText.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';

export const FaqScreen = () => {
  const {data, refetch, isFetching} = useFaqQuery();
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
