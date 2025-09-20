import {Card, Text} from 'react-native-paper';
import {AppView} from '#src/Views/AppView.tsx';
import React from 'react';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {RefreshControl, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {LoadingView} from '#src/Views/Static/LoadingView.tsx';
import {useStyles} from '#src/Context/Contexts/StyleContext.ts';
import {APIImage} from '#src/Images/APIImage.tsx';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {LinkIconButton} from '#src/Buttons/IconButtons/LinkIconButton.tsx';
import {PerformerYearsCard} from '#src/Cards/Performer/PerformerYearsCard.tsx';
import {PerformerBioCard} from '#src/Cards/Performer/PerformerBioCard.tsx';
import {EventCard} from '#src/Cards/Schedule/EventCard.tsx';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens.tsx';
import {PerformerData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {AppIcon} from '#src/Icons/AppIcon.tsx';

interface PerformerScreenBaseProps {
  performerData: PerformerData;
  onRefresh?: () => Promise<void>;
  isFetching?: boolean;
}

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

export const PerformerScreenBase = ({performerData, onRefresh, isFetching = false}: PerformerScreenBaseProps) => {
  const {commonStyles} = useStyles();
  const navigation = useCommonStack();

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

  if (!performerData) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} />}
        isStack={true}>
        <PaddedContentView style={styles.listContentContainer} padTop={true}>
          {performerData.header.photo && (
            <APIImage
              thumbPath={`/image/thumb/${performerData.header.photo}`}
              fullPath={`/image/full/${performerData.header.photo}`}
              mode={'image'}
              style={styles.image}
            />
          )}
        </PaddedContentView>
        <PaddedContentView style={styles.listContentContainer} padBottom={false}>
          <Text variant={'headlineMedium'} selectable={true}>
            {performerData.header.name}
            {performerData.header.isOfficialPerformer && (
              <>
                &nbsp;
                <AppIcon icon={AppIcons.official} />
              </>
            )}
          </Text>
        </PaddedContentView>
        <PaddedContentView style={styles.listContentContainer}>
          <Text variant={'bodyMedium'} selectable={true}>
            {performerData.pronouns}
          </Text>
        </PaddedContentView>
        {(performerData.title || performerData.organization) && (
          <PaddedContentView style={styles.listContentContainer}>
            <View style={styles.titleContentContainer}>
              {performerData.title && <Text>{performerData.title}</Text>}
              {performerData.organization && <Text>{performerData.organization}</Text>}
            </View>
          </PaddedContentView>
        )}
        {performerData.bio && (
          <PaddedContentView style={styles.listContentContainer}>
            <PerformerBioCard bio={performerData.bio} />
          </PaddedContentView>
        )}
        <PerformerLinksView style={styles.listContentContainer} data={performerData} />
        {performerData.yearsAttended.length !== 0 && (
          <PaddedContentView style={styles.listContentContainer}>
            <PerformerYearsCard years={performerData.yearsAttended} />
          </PaddedContentView>
        )}
        {performerData.events.length !== 0 && (
          <PaddedContentView>
            <Card>
              <Card.Title title={'Hosted Events'} />
              {performerData.events.map((event, index) => (
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
