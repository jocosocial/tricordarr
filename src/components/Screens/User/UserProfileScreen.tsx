import React, {useCallback, useEffect, useState} from 'react';
import {Card, Text, List} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {AppView} from '../../Views/AppView';
import {SeamailStackParamList} from '../../Navigation/Stacks/SeamailStack';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useQuery} from '@tanstack/react-query';
import {ProfilePublicData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {RefreshControl, View} from 'react-native';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {LoadingView} from '../../Views/Static/LoadingView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {AppImage} from '../../Images/AppImage';
import {ListSection} from '../../Lists/ListSection';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {NavBarIconButton} from '../../Buttons/IconButtons/NavBarIconButton';
import {DataFieldListItem} from '../../Lists/Items/DataFieldListItem';
import {UserProfileActionsMenu} from '../../Menus/UserProfileActionsMenu';
import {AppIcons} from '../../../libraries/Enums/Icons';

export type Props = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.userProfileScreen,
  NavigatorIDs.userStack
>;

export const UserProfileScreen = ({route, navigation}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const {isLoggedIn} = useUserData();
  const {commonStyles} = useStyles();

  const {data, refetch} = useQuery<ProfilePublicData>({
    queryKey: [`/users/${route.params.userID}/profile`],
    enabled: isLoggedIn,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const seamailCreateHandler = () => {
    navigation.push(SeamailStackScreenComponents.seamailCreateScreen, {
      initialUserHeader: data?.header,
    });
  };

  const krakentalkCreateHandler = () => {
    navigation.push(SeamailStackScreenComponents.krakentalkCreateScreen, {
      initialUserHeader: data?.header,
    });
  };

  const getNavButtons = useCallback(() => {
    return (
      <View style={[commonStyles.flexRow]}>
        <NavBarIconButton icon={AppIcons.seamailCreate} onPress={seamailCreateHandler} />
        <NavBarIconButton icon={AppIcons.krakentalkCreate} onPress={krakentalkCreateHandler} />
        {data && <UserProfileActionsMenu profile={data} />}
      </View>
    );
  }, [commonStyles.flexRow, data]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (!data) {
    return <LoadingView />;
  }

  const styles = {
    image: [commonStyles.roundedBorderLarge, commonStyles.headerImage],
    listContentCenter: [commonStyles.flexRow, commonStyles.justifyCenter],
    button: [commonStyles.marginHorizontalSmall],
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {data.message && (
          <PaddedContentView padTop={true} padBottom={false} style={[styles.listContentCenter]}>
            <Text selectable={true}>{data.message}</Text>
          </PaddedContentView>
        )}
        <PaddedContentView padTop={true} style={[styles.listContentCenter]}>
          <AppImage style={styles.image} path={`/image/user/thumb/${route.params.userID}`} />
        </PaddedContentView>
        <PaddedContentView style={[styles.listContentCenter]}>
          <Text selectable={true} variant={'headlineMedium'}>
            {UserHeader.getByline(data.header)}
          </Text>
        </PaddedContentView>
        {data.note && (
          <PaddedContentView>
            <Card style={[commonStyles.noteContainer]}>
              <Card.Title title="Private Note" titleStyle={[commonStyles.onNoteContainer]} />
              <Card.Content>
                <Text selectable={true} style={[commonStyles.onNoteContainer, commonStyles.italics]}>{data.note}</Text>
              </Card.Content>
            </Card>
          </PaddedContentView>
        )}
        <PaddedContentView>
          <Card>
            <Card.Title title="User Profile" />
            <Card.Content style={[commonStyles.paddingHorizontalZero]}>
              <ListSection>
                {data.header.displayName && (
                  <DataFieldListItem title={'Display Name'} description={data.header.displayName} />
                )}
                {data.realName && <DataFieldListItem title={'Real Name'} description={data.realName} />}
                {data.header.username && <DataFieldListItem title={'Username'} description={data.header.username} />}
                {data.preferredPronoun && <DataFieldListItem title={'Pronouns'} description={data.preferredPronoun} />}
                {data.email && <DataFieldListItem title={'Email'} description={data.email} />}
                {data.homeLocation && <DataFieldListItem title={'Home Location'} description={data.homeLocation} />}
                {data.roomNumber && <DataFieldListItem title={'Room Number'} description={data.roomNumber} />}
              </ListSection>
            </Card.Content>
          </Card>
        </PaddedContentView>
        {data.about && (
          <PaddedContentView>
            <Card>
              <Card.Title title="About" />
              <Card.Content>
                <Text selectable={true}>{data.about}</Text>
              </Card.Content>
            </Card>
          </PaddedContentView>
        )}
        <PaddedContentView>
          <Card>
            <Card.Title title={`Content by @${data.header.username}`} />
            <Card.Content style={[commonStyles.paddingHorizontalZero]}>
              <ListSection>
                <List.Item title={'Twarrts'} onPress={() => console.log('waaa')} />
                <List.Item title={'Forums'} onPress={() => console.log('waaa')} />
                <List.Item title={'LFGs'} onPress={() => console.log('waaa')} />
              </ListSection>
            </Card.Content>
          </Card>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
