import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {FezParticipantListItem} from '#src/Components/Lists/Items/FezParticipantListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface ModerationContentParticipantsSectionViewProps {
  participants: UserHeader[];
  owner: UserHeader;
  isDeleted?: boolean;
  isRemoving?: boolean;
  onRemove: (user: UserHeader) => void;
}

/**
 * Participants section on a content moderate screen. Each row opens the profile;
 * a shield opens Moderate User; delete removes the person when allowed.
 */
export const ModerationContentParticipantsSectionView = ({
  participants,
  owner,
  isDeleted = false,
  isRemoving = false,
  onRemove,
}: ModerationContentParticipantsSectionViewProps) => {
  const navigation = useCommonStack();
  const canRemove = !isDeleted && !isRemoving;

  return (
    <View>
      <ListSection>
        <ListSubheader>Participants</ListSubheader>
      </ListSection>
      {participants.length === 0 ? (
        <PaddedContentView padTop={true}>
          <Text>No participants.</Text>
        </PaddedContentView>
      ) : (
        participants.map(participant => (
          <FezParticipantListItem
            key={participant.userID}
            user={participant}
            owner={owner}
            allowRemove={canRemove}
            onRemove={canRemove ? () => onRemove(participant) : undefined}
            onPress={() =>
              navigation.push(CommonStackComponents.userProfileScreen, {
                userID: participant.userID,
              })
            }
            onModerate={() => pushModerateResource(navigation, 'user', participant.userID)}
          />
        ))
      )}
    </View>
  );
};
