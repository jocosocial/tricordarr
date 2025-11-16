import {useNavigation} from '@react-navigation/native';
import React from 'react';

import {MainConductScreenActionsMenu} from '#src/Components/Menus/Main/MainConductScreenActionsMenu';
import {MarkdownScreenBase} from '#src/Components/Screens/MarkdownScreenBase';
import {useConductQuery} from '#src/Queries/PublicQueries';

export const MainConductScreen = () => {
  const {data, refetch, isFetching} = useConductQuery();
  const navigation = useNavigation();

  return (
    <MarkdownScreenBase
      data={data}
      refetch={refetch}
      isFetching={isFetching}
      enableSearch={true}
      searchPlaceholder={'Search Code of Conduct...'}
      navigation={navigation}
      actionsMenu={<MainConductScreenActionsMenu />}
    />
  );
};
