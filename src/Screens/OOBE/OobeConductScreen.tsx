import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {MarkdownScreenBase} from '#src/Components/Screens/MarkdownScreenBase';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';
import {useConductQuery} from '#src/Queries/PublicQueries';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeConductScreen>;

export const OobeConductScreen = ({navigation}: Props) => {
  const {data, refetch, isFetching} = useConductQuery();
  const {commonStyles} = useStyles();

  return (
    <MarkdownScreenBase
      data={data}
      refetch={refetch}
      isFetching={isFetching}
      safeEdges={['bottom']}
      scrollViewStyle={commonStyles.marginBottomZero}
      footer={
        <OobeButtonsView
          leftOnPress={() => navigation.goBack()}
          rightText={'I Agree'}
          rightOnPress={() => navigation.push(OobeStackComponents.oobeAccountScreen)}
          rightDisabled={!data}
        />
      }
    />
  );
};
