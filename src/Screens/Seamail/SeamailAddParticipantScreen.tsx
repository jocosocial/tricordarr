import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {FezData, UserHeader} from '#src/Structs/ControllerStructs';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {UserSearchBar} from '#src/Components/Search/UserSearchBar';
import {useFezParticipantMutation} from '#src/Queries/Fez/Management/FezManagementUserMutations';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
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
