import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {UserMatchSearchBar} from '#src/Components/Search/UserSearchBar/UserMatchSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useFezData} from '#src/Hooks/useFezData';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezParticipantMutation} from '#src/Queries/Fez/Management/FezManagementUserMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {UserHeader} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.lfgAddParticipantScreen>;

export const LfgAddParticipantScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.lfgHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.friendlyfez} urlPath={`/lfg/${props.route.params.fezID}/members`}>
        <LfgAddParticipantScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const LfgAddParticipantScreenInner = ({route, navigation}: Props) => {
  const participantMutation = useFezParticipantMutation();
  const {fezData: lfg} = useFezData({fezID: route.params.fezID});
  const {updateMembership} = useFezCacheReducer();

  const onPress = (user: UserHeader) => {
    participantMutation.mutate(
      {
        action: 'add',
        fezID: route.params.fezID,
        userID: user.userID,
      },
      {
        onSuccess: response => {
          updateMembership(route.params.fezID, response.data);
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
      <ScrollingContentView refreshControl={<AppRefreshControl refreshing={participantMutation.isPending} />}>
        <PaddedContentView>
          <Text>
            Don't just add random people to your {FezType.getChatTypeString(route.params.fezType)}. It's not nice.
            Anyone you add should already expect to be added or know you.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <UserMatchSearchBar excludeHeaders={lfg.members.participants || []} onPress={onPress} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
