import {StackScreenProps} from '@react-navigation/stack';
import {type FlashListRef} from '@shopify/flash-list';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {Divider} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {BoardgameRecommendationForm} from '#src/Components/Forms/BoardgameRecommendationForm';
import {BoardgameFlatList} from '#src/Components/Lists/Boardgames/BoardgameFlatList';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {useBoardgameRecommendMutation} from '#src/Queries/Boardgames/BoardgameMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {MaintenanceModeScreen} from '#src/Screens/Checkpoint/MaintenanceModeScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {BoardgameData, BoardgameRecommendationData} from '#src/Structs/ControllerStructs';

const defaultValues: BoardgameRecommendationData = {
  numPlayers: 2,
  timeToPlay: 30,
  maxAge: 0,
  complexity: 1,
  minAge: 0,
};

const ListHeader = ({
  initialValues,
  onSubmit,
  games,
}: {
  initialValues: BoardgameRecommendationData;
  onSubmit: (values: BoardgameRecommendationData, helpers: FormikHelpers<BoardgameRecommendationData>) => void;
  games: BoardgameData[];
}) => (
  <>
    <PaddedContentView padTop={true}>
      <BoardgameRecommendationForm initialValues={initialValues} onSubmit={onSubmit} />
    </PaddedContentView>
    {games.length > 0 && <Divider bold={true} />}
  </>
);

type Props = StackScreenProps<MainStackParamList, MainStackComponents.boardgameRecommendScreen>;

export const BoardgameRecommendScreen = (props: Props) => {
  return (
    <MaintenanceModeScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.boardgameHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.gameslist} urlPath={'/boardgames/guide'}>
          <BoardgameRecommendScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </MaintenanceModeScreen>
  );
};

const BoardgameRecommendScreenInner = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const guideMutation = useBoardgameRecommendMutation();
  const [games, setGames] = useState<BoardgameData[]>([]);
  const [fieldValues, setFieldValues] = useState<BoardgameRecommendationData>(defaultValues);
  const listRef = useRef<FlashListRef<BoardgameData>>(null);

  const onSubmit = async (values: BoardgameRecommendationData, helpers: FormikHelpers<BoardgameRecommendationData>) => {
    setFieldValues(values);
    try {
      const response = await guideMutation.mutateAsync({recommendationData: values});
      setGames(response.data.gameArray);
      // Animate scroll to top to show results
      requestAnimationFrame(() => {
        try {
          listRef.current?.scrollToIndex({index: 0, animated: true});
        } catch {
          // If scrollToIndex fails (e.g., list not fully rendered), use scrollToOffset as fallback
          listRef.current?.scrollToOffset({offset: 0, animated: true});
        }
      });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const getHeader = () => <ListHeader onSubmit={onSubmit} initialValues={fieldValues} games={games} />;

  const getNavButtons = useCallback(
    () => (
      <View>
        <MaterialHeaderButtons left>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.boardgameHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    ),
    [navigation],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <AppView>
      {/* The recommendation form (with its own TextInputs) renders as this list's
          ListHeaderComponent rather than above a ScrollingContentView, so neither the
          form nor chat keyboard patterns apply here (issue #573). A scoped KAV resizing
          the list is acceptable since the form lives in the list's own header. */}
      <KeyboardAvoidingView style={commonStyles.flex} behavior={'padding'}>
        <BoardgameFlatList ref={listRef} items={games} listHeader={getHeader} />
      </KeyboardAvoidingView>
    </AppView>
  );
};
