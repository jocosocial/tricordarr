import React from 'react';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {EventPerformerListItem} from '#src/Components/Lists/Items/Event/EventPerformerListItem';
import {EventPhotographerListItem} from '#src/Components/Lists/Items/Event/EventPhotographerListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ContentText} from '#src/Components/Text/ContentText';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {AppIcons} from '#src/Enums/Icons';
import {getDurationString} from '#src/Libraries/DateTime';
import {guessDeckNumber} from '#src/Libraries/Ship';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {EventData} from '#src/Structs/ControllerStructs';

interface Props {
  eventData?: EventData;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const EventScreenBase = ({eventData, refreshing = false, onRefresh}: Props) => {
  const navigation = useCommonStack();

  const handleLocation = () => {
    if (!eventData) {
      return;
    }
    const deck = guessDeckNumber(eventData.location);
    navigation.push(CommonStackComponents.mapScreen, {
      deckNumber: deck,
    });
  };

  if (!eventData) {
    return <LoadingView />;
  }

  const getDescriptionContent = () => <ContentText text={eventData.description} />;

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padSides={false}>
          <ListSection>
            <DataFieldListItem icon={AppIcons.events} description={eventData.title} title={'Title'} />
            <DataFieldListItem
              icon={AppIcons.time}
              description={getDurationString(eventData.startTime, eventData.endTime, eventData.timeZoneID, true)}
              title={'Date'}
            />
            <DataFieldListItem
              icon={AppIcons.map}
              description={eventData.location}
              title={'Location'}
              onPress={handleLocation}
            />
            <DataFieldListItem icon={AppIcons.type} description={eventData.eventType} title={'Type'} />
            {eventData.description && (
              <DataFieldListItem
                icon={AppIcons.description}
                description={getDescriptionContent}
                title={'Description'}
              />
            )}
            {eventData.performers.length !== 0 && <EventPerformerListItem performers={eventData.performers} />}
            {eventData.shutternautData?.photographers && eventData.shutternautData.photographers.length !== 0 && (
              <EventPhotographerListItem photographers={eventData.shutternautData.photographers} />
            )}
          </ListSection>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
