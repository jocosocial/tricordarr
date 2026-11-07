import {StackScreenProps} from '@react-navigation/stack';
import {formatDistanceToNow} from 'date-fns';
import React, {useCallback, useEffect, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Chip, List, Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {APIImage} from '#src/Components/Images/APIImage';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {QuartermasterItemActionsMenu} from '#src/Components/Menus/Quartermaster/QuartermasterItemActionsMenu';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {ContentModerationStatus} from '#src/Enums/ContentModerationStatus';
import {AppIcons} from '#src/Enums/Icons';
import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';
import {useQuartermasterViewer} from '#src/Hooks/Quartermaster/useQuartermasterViewer';
import {useRefresh} from '#src/Hooks/useRefresh';
import {
  canInteractWithQuartermasterItem,
  canMessageQuartermasterOwner,
  getQuartermasterSeamailSubject,
  isRestrictedQuartermasterItem,
} from '#src/Libraries/Quartermaster/QuartermasterAccess';
import {guessDeckNumber} from '#src/Libraries/Ship';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useQuartermasterItemQuery} from '#src/Queries/Quartermaster/QuartermasterQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.quartermasterItemScreen>;

/**
 * Detail screen for a Quartermastarr item, wrapped in the standard checkpoints.
 */
export const QuartermasterItemScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.quartermasterHelpScreen}>
        <DisabledFeatureScreen
          feature={SwiftarrFeature.quartermaster}
          urlPath={`/quartermaster/${props.route.params.itemID}`}>
          <QuartermasterItemScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

/**
 * Detail view of one item: name, category, photo, description, location, and owner. A Seamail
 * button for the owner and the actions menu (Edit/Delete for your own items) are in the header.
 */
const QuartermasterItemScreenInner = ({navigation, route}: Props) => {
  const {itemID} = route.params;
  const {commonStyles} = useStyles();
  const viewer = useQuartermasterViewer();
  const {data: item, refetch, isLoading} = useQuartermasterItemQuery(itemID);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.gapSmall,
        },
        photo: {
          ...commonStyles.marginVerticalSmall,
        },
      }),
    [commonStyles],
  );

  const canMessage =
    !!item && canMessageQuartermasterOwner(item, viewer) && canInteractWithQuartermasterItem(item, viewer);

  /**
   * Header buttons: Seamail the owner (when allowed), then the actions menu.
   */
  const getNavButtons = useCallback(() => {
    if (!item) {
      return null;
    }
    return (
      <View>
        <MaterialHeaderButtons>
          {canMessage && item.owner && (
            <Item
              title={'Send Seamail'}
              iconName={AppIcons.seamail}
              onPress={() =>
                navigation.push(CommonStackComponents.seamailCreateScreen, {
                  initialUserHeaders: [item.owner!],
                  initialTitle: getQuartermasterSeamailSubject(item),
                })
              }
            />
          )}
          <QuartermasterItemActionsMenu item={item} />
        </MaterialHeaderButtons>
      </View>
    );
  }, [item, canMessage, navigation]);

  useEffect(() => {
    navigation.setOptions({headerRight: getNavButtons});
  }, [navigation, getNavButtons]);

  if (isLoading || !item) {
    return (
      <AppView>
        <LoadingView refreshing={refreshing} onRefresh={onRefresh} />
      </AppView>
    );
  }

  // Only items with a location the ship map can place get a map link.
  const onLocationPress =
    item.location && guessDeckNumber(item.location) !== undefined
      ? () => navigation.push(CommonStackComponents.mapScreen, {location: item.location})
      : undefined;
  const restricted = isRestrictedQuartermasterItem(item);
  const locked = item.moderationStatus === ContentModerationStatus.locked;

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <View style={styles.header}>
            <Chip compact={true}>{QuartermasterCategory.getLabel(item.category)}</Chip>
            {locked && (
              <Chip compact={true} icon={AppIcons.locked}>
                {ContentModerationStatus.getLabel(ContentModerationStatus.locked)}
              </Chip>
            )}
          </View>
          {restricted && !locked && (
            <Text variant={'labelMedium'}>{ContentModerationStatus.getLabel(item.moderationStatus)}</Text>
          )}
        </PaddedContentView>
        {item.image && (
          <View style={styles.photo}>
            <APIImage path={item.image} mode={'scaledimage'} />
          </View>
        )}
        <DataFieldListItem title={'Name'} description={item.itemName} />
        {item.itemDescription ? <DataFieldListItem title={'Description'} description={item.itemDescription} /> : null}
        <DataFieldListItem
          title={'Location'}
          description={item.location || 'Not specified'}
          onPress={onLocationPress}
        />
        <DataFieldListItem
          title={'Updated At'}
          description={formatDistanceToNow(new Date(item.lastModificationTime), {addSuffix: true})}
        />
        {item.owner ? (
          <>
            <List.Subheader>Posted by</List.Subheader>
            <UserListItem
              userHeader={item.owner}
              onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {userID: item.owner!.userID})}
            />
          </>
        ) : (
          <DataFieldListItem title={'Posted by'} description={'Anonymous -- use the location to find them.'} />
        )}
      </ScrollingContentView>
    </AppView>
  );
};
