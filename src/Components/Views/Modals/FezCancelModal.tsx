import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ModalCard} from '#src/Components/Cards/ModalCard';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {FezType} from '#src/Enums/FezType';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useScrollToTopIntent} from '#src/Hooks/useScrollToTopIntent';
import {LfgStackComponents} from '#src/Navigation/Stacks/LFGStackNavigator';
import {useFezCancelMutation} from '#src/Queries/Fez/FezMutations';
import {FezData} from '#src/Structs/ControllerStructs';

const ModalContent = ({fez}: {fez: FezData}) => {
  const {commonStyles} = useStyles();
  const noun = FezType.isLFGType(fez.fezType) ? 'LFG' : 'event';
  return (
    <>
      <Text style={[commonStyles.marginBottomSmall]}>
        Cancelling the {noun} will mark it as not happening and notify all participants. The {noun} won't be deleted;
        participants can still create and read posts.
      </Text>
      <Text style={[commonStyles.marginBottomSmall]}>
        If you haven't, you may want to make a post letting participants know why the event was cancelled.
      </Text>
    </>
  );
};

export const FezCancelModal = ({fezData}: {fezData: FezData}) => {
  const {setSnackbarPayload} = useSnackbar();
  const {setModalVisible} = useModal();
  const {theme} = useAppTheme();
  const cancelMutation = useFezCancelMutation();
  const {cancelFez} = useFezCacheReducer();
  const dispatchScrollToTop = useScrollToTopIntent();

  const onSubmit = () => {
    cancelMutation.mutate(
      {
        fezID: fezData.fezID,
      },
      {
        onSuccess: response => {
          setSnackbarPayload({message: 'Successfully canceled this event.', messageType: 'info'});
          cancelFez(fezData.fezID, response.data);
          dispatchScrollToTop(LfgStackComponents.lfgListScreen, {key: 'endpoint', value: 'joined'});
          setModalVisible(false);
        },
      },
    );
  };

  const cardActions = (
    <PrimaryActionButton
      buttonColor={theme.colors.twitarrNegativeButton}
      buttonText={'Cancel Event'}
      onPress={onSubmit}
      isLoading={cancelMutation.isPending}
      disabled={cancelMutation.isPending}
    />
  );

  return (
    <View>
      <ModalCard
        title={'Cancel'}
        closeButtonText={'Close'}
        content={<ModalContent fez={fezData} />}
        actions={cardActions}
      />
    </View>
  );
};
