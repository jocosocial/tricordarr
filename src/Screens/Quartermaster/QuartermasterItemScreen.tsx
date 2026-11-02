import {StackScreenProps} from '@react-navigation/stack';
import {formatDistanceToNow} from 'date-fns';
import React, {useCallback, useEffect, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Chip, Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
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
  canModifyQuartermasterItem,
  getQuartermasterSeamailSubject,
  isRestrictedQuartermasterItem,
} from '#src/Libraries/Quartermaster/QuartermasterAccess';
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
 * Detail view of one item: name, category, photo, description, location, owner, and a button to
 * Seamail the owner. Edit and the actions menu are in the header.
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
        title: {
          ...commonStyles.flex,
          ...commonStyles.bold,
        },
        photo: {
          ...commonStyles.marginVerticalSmall,
        },
      }),
    [commonStyles],
  );

  const canEdit = !!item && canModifyQuartermasterItem(item, viewer);

  const getNavButtons = useCallback(() => {
    if (!item) {
      return null;
    }
    return (
      <View>
        <MaterialHeaderButtons>
          {canEdit && (
            <Item
              title={'Edit'}
              iconName={AppIcons.edit}
              onPress={() => navigation.push(CommonStackComponents.quartermasterEditScreen, {item})}
            />
          )}
          <QuartermasterItemActionsMenu item={item} />
        </MaterialHeaderButtons>
      </View>
    );
  }, [item, canEdit, navigation]);

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

  const restricted = isRestrictedQuartermasterItem(item);
  const locked = item.moderationStatus === ContentModerationStatus.locked;
  const canMessage = canMessageQuartermasterOwner(item, viewer) && canInteractWithQuartermasterItem(item, viewer);

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <View style={styles.header}>
            <Text variant={'titleLarge'} style={styles.title}>
              {item.itemName}
            </Text>
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
          <Text variant={'labelMedium'}>
            Updated {formatDistanceToNow(new Date(item.lastModificationTime), {addSuffix: true})}
          </Text>
        </PaddedContentView>
        {item.image && (
          <View style={styles.photo}>
            <APIImage path={item.image} mode={'scaledimage'} />
          </View>
        )}
        {item.itemDescription ? <DataFieldListItem title={'Description'} description={item.itemDescription} /> : null}
        <DataFieldListItem title={'Location'} description={item.location || 'Not specified'} />
        {item.owner ? (
          <UserListItem
            userHeader={item.owner}
            onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {userID: item.owner!.userID})}
          />
        ) : (
          <DataFieldListItem title={'Posted by'} description={'Anonymous -- use the location to find them.'} />
        )}
        {canMessage && item.owner && (
          <PaddedContentView padTop={true}>
            <PrimaryActionButton
              buttonText={'Send Seamail'}
              icon={AppIcons.seamail}
              testID={'quartermasterSeamail-button'}
              onPress={() =>
                navigation.push(CommonStackComponents.seamailCreateScreen, {
                  initialUserHeaders: [item.owner!],
                  initialTitle: getQuartermasterSeamailSubject(item),
                })
              }
            />
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
