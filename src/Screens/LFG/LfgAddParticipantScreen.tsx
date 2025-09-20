import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppView} from '#src/Views/AppView.tsx';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {UserHeader} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView.tsx';
import {UserSearchBar} from '#src/Search/UserSearchBar.tsx';
import {useFezParticipantMutation} from '#src/Queries/Fez/Management/FezManagementUserMutations.ts';
import {LoadingView} from '#src/Views/Static/LoadingView.tsx';
import {RefreshControl} from 'react-native';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens.tsx';
import {useFezQuery} from '#src/Queries/Fez/FezQueries.ts';
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
