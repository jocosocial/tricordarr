import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {UserSearchBar} from '#src/Components/Search/UserSearchBar';
import {useFezParticipantMutation} from '#src/Queries/Fez/Management/FezManagementUserMutations';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {RefreshControl} from 'react-native';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezQuery} from '#src/Queries/Fez/FezQueries';
import {useQueryClient} from '@tanstack/react-query';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.lfgAddParticipantScreen>;

export const LfgAddParticipantScreen = ({route, navigation}: Props) => {
  const participantMutation = useFezParticipantMutation();
  const {data} = useFezQuery({
    fezID: route.params.fezID,
  });
  const lfg = data?.pages[0];
  const queryClient = useQueryClient();

  const onPress = (user: UserHeader) => {
    participantMutation.mutate(
      {
        action: 'add',
        fezID: route.params.fezID,
        userID: user.userID,
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries([`/fez/${route.params.fezID}`]);
          navigation.goBack();
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
          <UserSearchBar excludeHeaders={lfg.members.participants || []} onPress={onPress} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
