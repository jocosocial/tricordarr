import {Card, Chip, Text} from 'react-native-paper';
import {AppView} from '../../Views/AppView.tsx';
import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {usePerformerQuery} from '../../Queries/Performer/PerformerQueries.ts';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {RefreshControl, StyleSheet, View} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {APIImage} from '../../Images/APIImage.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {LinkIconButton} from '../../Buttons/IconButtons/LinkIconButton.tsx';
import {PerformerActionsMenu} from '../../Menus/Performer/PerformerActionsMenu.tsx';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {HeaderButtons} from 'react-navigation-header-buttons';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.performerScreen>;

export const PerformerScreen = ({route, navigation}: Props) => {
  const {data, refetch, isFetching} = usePerformerQuery(route.params.id);
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    image: {
      ...commonStyles.roundedBorderLarge,
      ...commonStyles.headerImage,
    },
    listContentContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifyCenter,
    },
    chipContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifyCenter,
      ...commonStyles.flexWrap,
      ...commonStyles.paddingTopSmall,
    },
    chip: {
      ...commonStyles.marginRightSmall,
      ...commonStyles.marginBottomSmall,
    },
    chipCard: {
      ...commonStyles.flex,
    },
  });

  const getHeaderButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <PerformerActionsMenu id={route.params.id} />
        </HeaderButtons>
      </View>
    );
  }, [route.params.id]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getHeaderButtons,
    });
  }, [navigation, getHeaderButtons]);

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        isStack={true}>
        <PaddedContentView style={styles.listContentContainer} padTop={true}>
          <APIImage
            thumbPath={`/image/thumb/${data.header.photo}`}
            fullPath={`/image/full/${data.header.photo}`}
            mode={'image'}
            style={styles.image}
          />
        </PaddedContentView>
        <PaddedContentView style={styles.listContentContainer} padBottom={false}>
          <Text variant={'headlineMedium'} selectable={true}>
            {data.header.name}
          </Text>
        </PaddedContentView>
        <PaddedContentView style={styles.listContentContainer}>
          <Text variant={'bodyMedium'} selectable={true}>
            {data.pronouns}
          </Text>
        </PaddedContentView>
        {(data.organization || data.title) && (
          <PaddedContentView style={styles.listContentContainer}>
            <Text>
              {data.title} of {data.organization}
            </Text>
          </PaddedContentView>
        )}
        <PaddedContentView style={styles.listContentContainer}>
          <Card>
            <Card.Content>
              <Text selectable={true}>{data.bio}</Text>
            </Card.Content>
          </Card>
        </PaddedContentView>
        <PaddedContentView style={styles.listContentContainer}>
          <View style={styles.listContentContainer}>
            <LinkIconButton link={data.website} icon={AppIcons.webview} />
            <LinkIconButton link={data.xURL} icon={AppIcons.twitter} />
            <LinkIconButton link={data.facebookURL} icon={AppIcons.facebook} />
            <LinkIconButton link={data.instagramURL} icon={AppIcons.instagram} />
            <LinkIconButton link={data.youtubeURL} icon={AppIcons.youtube} />
          </View>
        </PaddedContentView>
        <PaddedContentView style={styles.listContentContainer}>
          <Card style={styles.chipCard}>
            <Card.Title title={'Years Attended'} />
            <Card.Content style={styles.chipContainer}>
              {data.yearsAttended.map((year, index) => (
                <Chip key={index} style={styles.chip}>
                  {year}
                </Chip>
              ))}
            </Card.Content>
          </Card>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
