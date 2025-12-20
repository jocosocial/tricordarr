import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {RefreshControl} from 'react-native';

import {UserMatchSearchBar} from '#src/Components/Search/UserSearchBar/UserMatchSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezQuery} from '#src/Queries/Fez/FezQueries';
import {useFezParticipantMutation} from '#src/Queries/Fez/Management/FezManagementUserMutations';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/PreRegistrationScreen';
import {UserHeader} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.lfgAddParticipantScreen>;

export const LfgAddParticipantScreen = (props: Props) => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.friendlyfez} urlPath={`/lfg/${props.route.params.fezID}/members`}>
        <LfgAddParticipantScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const LfgAddParticipantScreenInner = ({route, navigation}: Props) => {
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
          await queryClient.invalidateQueries({queryKey: [`/fez/${route.params.fezID}`]});
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
      <ScrollingContentView refreshControl={<RefreshControl refreshing={participantMutation.isPending} />}>
        <PaddedContentView>
          <UserMatchSearchBar excludeHeaders={lfg.members.participants || []} onPress={onPress} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
