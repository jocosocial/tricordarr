import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useLfgListQuery} from '../../Queries/Fez/FezQueries';
import {RefreshControl, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {LfgCard} from '../../Cards/Schedule/LfgCard';
import {FezType} from '../../../libraries/Enums/FezType';

export const LfgOwnedScreen = () => {
  const {data, isFetched, isFetching, refetch} = useLfgListQuery({
    endpoint: 'owner',
    excludeFezType: [FezType.open, FezType.closed],
  });
  const {commonStyles} = useStyles();

  let lfgList: FezData[] = [];
  data?.pages.map(page => {
    page.fezzes.map(lfg => {
      lfgList.push(lfg);
    });
  });

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <PaddedContentView padTop={true}>
          {isFetched && lfgList.length === 0 && (
            <View key={'noResults'} style={[commonStyles.paddingVerticalSmall]}>
              <Text>No Results</Text>
            </View>
          )}
          {lfgList.map((lfg, i) => (
            <View key={i} style={[commonStyles.marginBottom]}>
              <LfgCard fez={lfg} />
            </View>
          ))}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
