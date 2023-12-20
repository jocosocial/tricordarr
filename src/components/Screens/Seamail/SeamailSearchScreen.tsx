import React, {useState} from 'react';
import {AppView} from '../../Views/AppView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {RefreshControl} from 'react-native';
import {SeamailSearchBar} from '../../Search/SeamailSearchBar';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SeamailStackParamList} from '../../Navigation/Stacks/SeamailStack';
import {NavigatorIDs, SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {NotImplementedView} from '../../Views/Static/NotImplementedView';

type SeamailSearchScreenProps = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.seamailSearchScreen,
  NavigatorIDs.seamailStack
>;

export const SeamailSearchScreen = ({route}: SeamailSearchScreenProps) => {
  const [refreshing, setRefreshing] = useState(false);
  if (route.params.forUser) {
    const text = `Seamail search is available for user accounts, not for privileged accounts like ${route.params.forUser}.`
    return <NotImplementedView additionalText={text} />;
  }
  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} enabled={false} />}>
        <PaddedContentView padSides={false}>
          <SeamailSearchBar setIsLoading={setRefreshing} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
