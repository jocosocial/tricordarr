import {Card, Text} from 'react-native-paper';
import {AppView} from '../../Views/AppView.tsx';
import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {usePerformerQuery} from '../../Queries/Performer/PerformerQueries.ts';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {RefreshControl, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {APIImage} from '../../Images/APIImage.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {LinkIconButton} from '../../Buttons/IconButtons/LinkIconButton.tsx';
import {PerformerActionsMenu} from '../../Menus/Performer/PerformerActionsMenu.tsx';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {PerformerYearsCard} from '../../Cards/Performer/PerformerYearsCard.tsx';
import {PerformerBioCard} from '../../Cards/Performer/PerformerBioCard.tsx';
import {EventCard} from '../../Cards/Schedule/EventCard.tsx';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {PerformerData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {AppIcon} from '../../Icons/AppIcon.tsx';

type Props = NativeStackScreenProps<MainStackParamList, CommonStackComponents.performerScreen>;

interface PerformerLinksViewProps {
  style: StyleProp<ViewStyle>;
  data: PerformerData;
}
const PerformerLinksView = (props: PerformerLinksViewProps) => {
  if (
    !props.data.website &&
    !props.data.xURL &&
    !props.data.facebookURL &&
    !props.data.instagramURL &&
    !props.data.youtubeURL
  ) {
    return <></>;
  }
  return (
    <PaddedContentView>
      <View style={props.style}>
        <LinkIconButton link={props.data.website} icon={AppIcons.webview} />
        <LinkIconButton link={props.data.xURL} icon={AppIcons.twitter} />
        <LinkIconButton link={props.data.facebookURL} icon={AppIcons.facebook} />
        <LinkIconButton link={props.data.instagramURL} icon={AppIcons.instagram} />
        <LinkIconButton link={props.data.youtubeURL} icon={AppIcons.youtube} />
      </View>
    </PaddedContentView>
  );
};

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
    eventCardContainer: {
      ...commonStyles.paddingBottomSmall,
    },
    titleContentContainer: {
      ...commonStyles.flexColumn,
      ...commonStyles.alignItemsCenter,
    },
  });

  const getHeaderButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <PerformerActionsMenu performerData={data} />
        </HeaderButtons>
      </View>
    );
  }, [data]);

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
            {data.header.isOfficialPerformer && (
              <>
                &nbsp;
                <AppIcon icon={AppIcons.official} />
              </>
            )}
          </Text>
        </PaddedContentView>
        <PaddedContentView style={styles.listContentContainer}>
          <Text variant={'bodyMedium'} selectable={true}>
            {data.pronouns}
          </Text>
        </PaddedContentView>
        {(data.title || data.organization) && (
          <PaddedContentView style={styles.listContentContainer}>
            <View style={styles.titleContentContainer}>
              {data.title && <Text>{data.title}</Text>}
              {data.organization && <Text>{data.organization}</Text>}
            </View>
          </PaddedContentView>
        )}
        {data.bio && (
          <PaddedContentView style={styles.listContentContainer}>
            <PerformerBioCard bio={data.bio} />
          </PaddedContentView>
        )}
        <PerformerLinksView style={styles.listContentContainer} data={data} />
        {data.yearsAttended.length !== 0 && (
          <PaddedContentView style={styles.listContentContainer}>
            <PerformerYearsCard years={data.yearsAttended} />
          </PaddedContentView>
        )}
        {data.events.length !== 0 && (
          <PaddedContentView>
            <Card>
              <Card.Title title={'Hosted Events'} />
              {data.events.map((event, index) => (
                <View key={index} style={styles.eventCardContainer}>
                  <EventCard
                    eventData={event}
                    showDay={true}
                    onPress={() => navigation.push(CommonStackComponents.eventScreen, {eventID: event.eventID})}
                  />
                </View>
              ))}
            </Card>
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
