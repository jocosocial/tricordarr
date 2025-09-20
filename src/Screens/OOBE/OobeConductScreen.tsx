import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useConductQuery} from '#src/Queries/PublicQueries';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {RefreshControl} from 'react-native';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ContentText} from '#src/Components/Text/ContentText';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';

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
