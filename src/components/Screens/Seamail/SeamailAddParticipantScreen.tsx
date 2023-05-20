import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SeamailStackParamList} from '../../Navigation/Stacks/SeamailStack';
import {NavigatorIDs, SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {UserSearchBar} from '../../Search/UserSearchBar';
import {useFezParticipantMutation} from '../../Queries/Fez/Management/UserQueries';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {FezListActions} from '../../Reducers/Fez/FezListReducers';

export type Props = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.seamailAddParticipantScreen,
  NavigatorIDs.seamailStack
>;

export const SeamailAddParticipantScreen = ({route, navigation}: Props) => {
  const participantMutation = useFezParticipantMutation();
  const {setFez} = useTwitarr();
  const {setErrorMessage} = useErrorHandler();
  const {dispatchFezList} = useTwitarr();

  const onPress = (user: UserHeader) => {
    participantMutation.mutate(
      {
        action: 'add',
        fezID: route.params.fez.fezID,
        userID: user.userID,
      },
      {
        onSuccess: response => {
          setFez(response.data);
          dispatchFezList({
            type: FezListActions.updateFez,
            fez: response.data,
          });
          navigation.goBack();
        },
        onError: error => {
          setErrorMessage(error.response?.data.reason);
        },
      },
    );
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <UserSearchBar userHeaders={route.params.fez.members?.participants || []} onPress={onPress} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
