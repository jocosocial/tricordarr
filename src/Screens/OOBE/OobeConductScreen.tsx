import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OobeStackComponents, OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator.tsx';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {OobeButtonsView} from '../../Views/OobeButtonsView.tsx';
import {useConductQuery} from '../../Queries/PublicQueries.ts';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {RefreshControl} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {ContentText} from '../../Text/ContentText.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeConductScreen>;

export const OobeConductScreen = ({navigation}: Props) => {
  const {data, refetch, isFetching} = useConductQuery();
  const {commonStyles} = useStyles();
  if (!data) {
    return <LoadingView onRefresh={refetch} refreshing={isFetching} />;
  }

  return (
    <AppView safeEdges={['bottom']}>
      <ScrollingContentView
        isStack={true}
        style={commonStyles.marginBottomZero}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <PaddedContentView>
          <ContentText text={data} forceMarkdown={true} />
        </PaddedContentView>
        <OobeButtonsView
          leftOnPress={() => navigation.goBack()}
          rightText={'I Agree'}
          rightOnPress={() => navigation.push(OobeStackComponents.oobeAccountScreen)}
          rightDisabled={!data}
        />
      </ScrollingContentView>
    </AppView>
  );
};
