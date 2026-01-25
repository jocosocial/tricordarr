import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {KeywordChip} from '#src/Components/Chips/KeywordChip';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {KeywordForm} from '#src/Components/Forms/KeywordForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useUserKeywordMutation} from '#src/Queries/User/UserMutations';
import {useUserKeywordQuery} from '#src/Queries/User/UserQueries';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {UserNotificationData} from '#src/Structs/ControllerStructs';
import {KeywordFormValues} from '#src/Types/FormValues';

export const AlertKeywordsScreen = () => {
  return (
    <LoggedInScreen>
      <AlertKeywordsScreenInner />
    </LoggedInScreen>
  );
};

const AlertKeywordsScreenInner = () => {
  const [refreshing, setIsRefreshing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const {commonStyles} = useStyles();
  const queryClient = useQueryClient();
  const navigation = useCommonStack();

  const {data, refetch} = useUserKeywordQuery({
    keywordType: 'alertwords',
  });
  const keywordMutation = useUserKeywordMutation();

  const handleChipPress = (keyword: string) => {
    keywordMutation.mutate(
      {
        keywordType: 'alertwords',
        keyword: keyword,
        action: 'remove',
      },
      {
        onSuccess: async () => {
          setKeywords(keywords.filter(kw => kw !== keyword));
          const invalidations = UserNotificationData.getCacheKeys()
            .concat([['/user/alertwords']])
            .map(key => queryClient.invalidateQueries({queryKey: key}));
          await Promise.all(invalidations);
        },
      },
    );
  };

  const handleNewWord = (values: KeywordFormValues, helpers: FormikHelpers<KeywordFormValues>) => {
    keywordMutation.mutate(
      {
        keywordType: 'alertwords',
        keyword: values.keyword,
        action: 'add',
      },
      {
        onSuccess: async () => {
          setKeywords([keywords, values.keyword].flat());
          helpers.resetForm();
          await queryClient.invalidateQueries({queryKey: ['/user/alertwords']});
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.keywordsHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    if (data) {
      setKeywords(data.keywords);
    }
  }, [data]);

  return (
    <AppView>
      <ScrollingContentView refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView>
          <Text>Generate an alert/notification whenever new content is made containing these keywords.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'labelMedium'}>Current Words:</Text>
          <View style={[commonStyles.flexRow, commonStyles.flexWrap, commonStyles.marginTopSmall]}>
            {keywords.length === 0 && <Text style={[commonStyles.italics]}>You have not set any words.</Text>}
            {keywords.map(keyword => (
              <KeywordChip key={keyword} keyword={keyword} onClose={() => handleChipPress(keyword)} />
            ))}
          </View>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'labelMedium'}>Add New Word:</Text>
          <KeywordForm onSave={handleNewWord} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
