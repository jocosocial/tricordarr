import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {FaqScreenActionsMenu} from '#src/Components/Menus/Main/FaqScreenActionsMenu';
import {MarkdownScreenBase} from '#src/Components/Screens/MarkdownScreenBase';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {useFaqQuery} from '#src/Queries/PublicQueries';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.faqScreen>;

export const FaqScreen = ({navigation}: Props) => {
  const {data, refetch, isFetching} = useFaqQuery();

  return (
    <MarkdownScreenBase
      data={data}
      refetch={refetch}
      isFetching={isFetching}
      enableSearch={true}
      navigation={navigation}
      actionsMenu={<FaqScreenActionsMenu />}
    />
  );
};
