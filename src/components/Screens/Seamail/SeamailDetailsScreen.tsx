import React, {useState} from 'react';
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

export type Props = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.seamailDetailsScreen,
  NavigatorIDs.seamailStack
>;

export const SeamailDetailsScreen = ({route, navigation}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const {isLoggedIn, isLoading} = useUserData();
  const {commonStyles} = useStyles();

  const {data, refetch} = useQuery<FezData>({
    queryKey: [`/fez/${route.params.fezID}`],
    enabled: isLoggedIn && !isLoading && !!route.params.fezID,
  });

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} />}>
        <PaddedContentView>
          <TitleTag>Seamail Name</TitleTag>
          <Text>{data?.title}</Text>
        </PaddedContentView>
        <PaddedContentView>
          <TitleTag>Type</TitleTag>
          <Text>{data?.fezType}</Text>
        </PaddedContentView>
        <PaddedContentView padBottom={false}>
          <TitleTag style={[]}>Options</TitleTag>
        </PaddedContentView>
        <PaddedContentView padSides={false}>
          <ListSection>
            <TextListItem title={'Manage Members'} onPress={() => console.log('some day')} />
          </ListSection>
        </PaddedContentView>
        <PaddedContentView padBottom={false}>
          <TitleTag style={[]}>Participants</TitleTag>
        </PaddedContentView>
        <PaddedContentView padSides={false}>
          <ListSection>
            {data &&
              data.members &&
              data.members.participants.map(u => <FezParticipantListItem key={u.userID} user={u} />)}
          </ListSection>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
