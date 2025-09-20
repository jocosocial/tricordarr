import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {FezData, UserHeader} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {UserSearchBar} from '../../Search/UserSearchBar.tsx';
import {useFezParticipantMutation} from '../../Queries/Fez/Management/FezManagementUserMutations.ts';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {useQueryClient} from '@tanstack/react-query';

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
            return queryClient.invalidateQueries(key);
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
