import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import React from 'react';

import {UserSearchBar} from '#src/Components/Search/UserSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezParticipantMutation} from '#src/Queries/Fez/Management/FezManagementUserMutations';
import {FezData, UserHeader} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.seamailAddParticipantScreen>;

export const SeamailAddParticipantScreen = ({route, navigation}: Props) => {
  const participantMutation = useFezParticipantMutation();
  const queryClient = useQueryClient();

  const onPress = (user: UserHeader) => {
    participantMutation.mutate(
      {
        action: 'add',
        fezID: route.params.fez.fezID,
        userID: user.userID,
      },
      {
        onSuccess: async () => {
          const invalidations = FezData.getCacheKeys(route.params.fez.fezID).map(key => {
            return queryClient.invalidateQueries({queryKey: key});
          });
          await Promise.all(invalidations);
          navigation.goBack();
        },
      },
    );
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <UserSearchBar excludeHeaders={route.params.fez.members?.participants || []} onPress={onPress} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
