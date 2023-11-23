import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LfgStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {UserSearchBar} from '../../Search/UserSearchBar';
import {useFezParticipantMutation} from '../../Queries/Fez/Management/UserQueries';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {LoadingView} from '../../Views/Static/LoadingView';
import {RefreshControl} from 'react-native';
import {LfgStackParamList} from '../../Navigation/Stacks/LFGStackNavigator';

export type Props = NativeStackScreenProps<
  LfgStackParamList,
  LfgStackComponents.lfgAddParticipantScreen,
  NavigatorIDs.lfgStack
>;

export const LfgAddParticipantScreen = ({route, navigation}: Props) => {
  const participantMutation = useFezParticipantMutation();
  const {lfg, setLfg} = useTwitarr();
  const {setErrorMessage} = useErrorHandler();

  const onPress = (user: UserHeader) => {
    participantMutation.mutate(
      {
        action: 'add',
        fezID: route.params.fezID,
        userID: user.userID,
      },
      {
        onSuccess: response => {
          setLfg(response.data);
          navigation.goBack();
        },
        onError: error => {
          setErrorMessage(error.response?.data.reason || error);
        },
      },
    );
  };

  if (!lfg || !lfg.members) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={participantMutation.isLoading} />}>
        <PaddedContentView>
          <UserSearchBar userHeaders={lfg.members.participants || []} onPress={onPress} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
