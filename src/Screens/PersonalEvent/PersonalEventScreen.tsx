import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {HeaderEditButton} from '#src/Components/Buttons/HeaderButtons/HeaderEditButton';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PersonalEventScreenActionsMenu} from '#src/Components/Menus/PersonalEvents/PersonalEventScreenActionsMenu';
import {PreRegistrationView} from '#src/Components/Views/Static/PreRegistrationView';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {useFezData, useMarkFezReadEffect} from '#src/Hooks/Fez/useFezData';
import {openFezChatScreen} from '#src/Libraries/Navigation';
import {isHttpNotFoundError} from '#src/Libraries/Network/Retry';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ScheduleItemScreenBase} from '#src/Screens/Schedule/ScheduleItemScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.personalEventScreen>;

export const PersonalEventScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.scheduleHelpScreen} allowed={true}>
      <DisabledFeatureScreen feature={SwiftarrFeature.personalevents} urlPath={'/privateevent/list'}>
        <PersonalEventScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

/**
 * Private event detail content. In pre-registration mode Swiftarr returns a 404 for any event the
 * user doesn't own, so that shows the PreRegistrationView rather than waiting forever on data that
 * won't come.
 */
const PersonalEventScreenInner = ({navigation, route}: Props) => {
  const {
    fezData: eventData,
    error,
    isFetching,
    isOwner,
    isParticipant,
    refetch,
    initialReadCount,
  } = useFezData({
    fezID: route.params.eventID,
  });
  useMarkFezReadEffect(eventData, initialReadCount);
  const {preRegistrationMode} = usePreRegistration();

  // Chat isn't available to pre-registration users.
  const showChat = !preRegistrationMode && eventData?.fezType === FezType.privateEvent && isParticipant;
  const showPreRegistrationView = preRegistrationMode && !eventData && isHttpNotFoundError(error);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons left>
          {eventData && (
            <>
              {showChat && (
                <Item
                  title={'Chat'}
                  iconName={AppIcons.chat}
                  onPress={() => openFezChatScreen(navigation, eventData.fezID, eventData.fezType, initialReadCount)}
                />
              )}
              {isOwner && (
                <HeaderEditButton
                  iconName={AppIcons.edit}
                  onPress={() =>
                    navigation.push(CommonStackComponents.personalEventEditScreen, {
                      personalEvent: eventData,
                    })
                  }
                />
              )}
              <PersonalEventScreenActionsMenu event={eventData} />
            </>
          )}
        </MaterialHeaderButtons>
      </View>
    );
  }, [eventData, navigation, showChat, isOwner, initialReadCount]);

  useEffect(() => {
    navigation.setOptions({
      // PreRegistrationView sets its own help button, and child effects run before this one.
      ...(showPreRegistrationView ? undefined : {headerRight: getNavButtons}),
      title: 'Private Event',
    });
  }, [getNavButtons, navigation, eventData, showPreRegistrationView]);

  if (showPreRegistrationView) {
    return <PreRegistrationView helpScreen={CommonStackComponents.scheduleHelpScreen} />;
  }

  return (
    <ScheduleItemScreenBase
      eventData={eventData}
      onRefresh={refetch}
      refreshing={isFetching}
      showLfgChat={showChat}
      initialReadCount={initialReadCount}
    />
  );
};
