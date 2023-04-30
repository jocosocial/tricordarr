import React, {useCallback, useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SeamailStackParamList} from '../../Navigation/Stacks/SeamailStack';
import {NavigatorIDs, SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {Divider, Text} from 'react-native-paper';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useQuery} from '@tanstack/react-query';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {RefreshControl, View} from 'react-native';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {TitleTag} from '../../Text/TitleTag';
import {ListSection} from '../../Lists/ListSection';
import {FezParticipantListItem} from '../../Lists/Items/FezParticipantListItem';
import {SeamailListItem} from '../../Lists/Items/SeamailListItem';
import {TextListItem} from '../../Lists/Items/TextListItem';
import {FezParticipantAddItem} from '../../Lists/Items/FezParticipantAddItem';
import {LoadingView} from '../../Views/Static/LoadingView';
import {FezType} from '../../../libraries/Enums/FezType';
import {useFezParticipantMutation} from '../../Queries/Fez/Management/UserQueries';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {NavBarIconButton} from '../../Buttons/IconButtons/NavBarIconButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useModal} from '../../Context/Contexts/ModalContext';
import {HelpModalView} from '../../Views/Modals/HelpModalView';

export type Props = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.seamailDetailsScreen,
  NavigatorIDs.seamailStack
>;

const helpContent = [
  'Seamail titles cannot be modified.',
  'With Open seamails, the creator can add or remove members at any time.',
];

export const SeamailDetailsScreen = ({route, navigation}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const {isLoggedIn, isLoading} = useUserData();
  const {commonStyles} = useStyles();
  const participantMutation = useFezParticipantMutation();
  const {fez, setFez} = useTwitarr();
  const {setModalContent, setModalVisible} = useModal();

  const {data, refetch} = useQuery<FezData>({
    queryKey: [`/fez/${route.params.fezID}`],
    enabled: isLoggedIn && !isLoading && !!route.params.fezID,
  });

  const onParticipantRemove = (fezID: string, userID: string) => {
    participantMutation.mutate(
      {
        action: 'remove',
        fezID: fezID,
        userID: userID,
      },
      {
        onSuccess: response => {
          // data = response.data;
          // refetch();
          setFez(response.data);
        },
      },
    );
  };

  const getHeaderRight = useCallback(
    () => (
      <NavBarIconButton
        icon={AppIcons.help}
        onPress={() => {
          setModalContent(<HelpModalView text={helpContent} />);
          setModalVisible(true);
        }}
      />
    ),
    [setModalContent, setModalVisible],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getHeaderRight,
    });
    if (data) {
      setFez(data);
    }
  }, [data, getHeaderRight, navigation, setFez]);

  if (!fez) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} />}>
        <PaddedContentView>
          <TitleTag>Title</TitleTag>
          <Text selectable={true}>{fez.title}</Text>
        </PaddedContentView>
        <PaddedContentView>
          <TitleTag>Type</TitleTag>
          <Text>{fez.fezType}</Text>
        </PaddedContentView>
        <PaddedContentView padBottom={false}>
          <TitleTag style={[]}>Participants</TitleTag>
        </PaddedContentView>
        <PaddedContentView padSides={false}>
          <ListSection>
            {fez.fezType === FezType.open && <FezParticipantAddItem fez={fez} />}
            {fez.members &&
              fez.members.participants.map(u => (
                <FezParticipantListItem
                  onRemove={() => onParticipantRemove(fez.fezID, u.userID)}
                  key={u.userID}
                  user={u}
                  fez={fez}
                />
              ))}
          </ListSection>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
