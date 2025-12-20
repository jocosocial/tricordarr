import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import React from 'react';

import {UserMatchSearchBar} from '#src/Components/Search/UserSearchBar/UserMatchSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezParticipantMutation} from '#src/Queries/Fez/Management/FezManagementUserMutations';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/PreRegistrationScreen';
import {FezData, UserHeader} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.seamailAddParticipantScreen>;

export const SeamailAddParticipantScreen = (props: Props) => {
  // Yes this is an /lfg route.
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.seamail} urlPath={`/lfg/${props.route.params.fez.fezID}/members`}>
        <SeamailAddParticipantScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const SeamailAddParticipantScreenInner = ({route, navigation}: Props) => {
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
          <UserMatchSearchBar excludeHeaders={route.params.fez.members?.participants || []} onPress={onPress} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
