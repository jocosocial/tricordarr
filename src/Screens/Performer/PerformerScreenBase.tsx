import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {PerformerBioCard} from '#src/Components/Cards/Performer/PerformerBioCard';
import {PerformerYearsCard} from '#src/Components/Cards/Performer/PerformerYearsCard';
import {EventCard} from '#src/Components/Cards/Schedule/EventCard';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {APIImage} from '#src/Components/Images/APIImage';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {PerformerLinksView} from '#src/Components/Views/Performer/PerformerLinksView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {PerformerData} from '#src/Structs/ControllerStructs';

interface Props {
  performerData: PerformerData;
  onRefresh?: () => Promise<void>;
  isFetching?: boolean;
}

export const PerformerScreenBase = ({performerData, onRefresh, isFetching = false}: Props) => {
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
        refreshControl={<AppRefreshControl refreshing={isFetching} onRefresh={onRefresh} />}
        isStack={true}>
        <PaddedContentView style={styles.listContentContainer} padTop={true}>
          {performerData.header.photo && (
            <APIImage path={performerData.header.photo} mode={'image'} style={styles.image} staticSize={'full'} />
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
              {performerData.title && <Text selectable={true}>{performerData.title}</Text>}
              {performerData.organization && <Text selectable={true}>{performerData.organization}</Text>}
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
