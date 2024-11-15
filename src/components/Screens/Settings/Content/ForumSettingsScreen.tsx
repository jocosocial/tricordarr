import React, {useState} from 'react';
import {AppView} from '../../../Views/AppView.tsx';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView.tsx';
import {View} from 'react-native';
import {BooleanField} from '../../../Forms/Fields/BooleanField.tsx';
import {Formik} from 'formik';
import {useStyles} from '../../../Context/Contexts/StyleContext.ts';
import {useConfig} from '../../../Context/Contexts/ConfigContext.ts';
import {PickerField} from '../../../Forms/Fields/PickerField.tsx';
import {ForumSort, ForumSortDirection} from '../../../../libraries/Enums/ForumSortFilter.ts';
import {useFilter} from '../../../Context/Contexts/FilterContext.ts';

export const ForumSettingsScreen = () => {
  const {commonStyles} = useStyles();
  const {appConfig, updateAppConfig} = useConfig();
  const [reverseSwipeOrientation, setReverseSwipeOrientation] = React.useState(
    appConfig.userPreferences.reverseSwipeOrientation,
  );
  const [defaultSortOrder, setDefaultSortOrder] = useState(appConfig.userPreferences.defaultForumSortOrder);
  const [defaultSortDirection, setDefaultSortDirection] = useState(appConfig.userPreferences.defaultForumSortDirection);
  const {setForumSortOrder, setForumSortDirection} = useFilter();

  const handleOrientation = () => {
    updateAppConfig({
      ...appConfig,
      userPreferences: {
        ...appConfig.userPreferences,
        reverseSwipeOrientation: !reverseSwipeOrientation,
      },
    });
    setReverseSwipeOrientation(!reverseSwipeOrientation);
  };

  const handleSortOrder = (value: ForumSort | undefined) => {
    updateAppConfig({
      ...appConfig,
      userPreferences: {
        ...appConfig.userPreferences,
        defaultForumSortOrder: value,
      },
    });
    setDefaultSortOrder(value);
    setForumSortOrder(value);
  };

  const handleSortDirection = (value: ForumSortDirection | undefined) => {
    updateAppConfig({
      ...appConfig,
      userPreferences: {
        ...appConfig.userPreferences,
        defaultForumSortDirection: value,
      },
    });
    setDefaultSortDirection(value);
    setForumSortDirection(value);
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <BooleanField
                name={'reverseSwipeOrientation'}
                label={'Reverse Swipe Orientation'}
                onPress={handleOrientation}
                style={commonStyles.paddingHorizontal}
                helperText={
                  'Switch the Left and Right swipe actions for swipeable items such as Forum Threads. Could be useful if you are left-handed.'
                }
                value={reverseSwipeOrientation}
              />
              <PickerField<ForumSort | undefined>
                name={'defaultForumSortOrder'}
                label={'Default Sort Order'}
                value={defaultSortOrder}
                choices={[ForumSort.create, ForumSort.title, ForumSort.update, ForumSort.event, undefined]}
                getTitle={value => ForumSort.getLabel(value)}
                anchorButtonMode={'contained'}
                helperText={
                  'Optionally specify the ordering you would like to see forum threads appear in. You can always change or disable this in the screen but your default will reset when the app re-launches. By default (or if set to None) the server will return results in Most Recent Post order.'
                }
                onSelect={handleSortOrder}
              />
              <PickerField<ForumSortDirection | undefined>
                name={'defaultForumSortDirection'}
                label={'Default Sort Direction'}
                value={defaultSortDirection}
                choices={[ForumSortDirection.ascending, ForumSortDirection.descending, undefined]}
                getTitle={value => ForumSortDirection.getLabel(value)}
                anchorButtonMode={'contained'}
                helperText={
                  'Optionally specify the sort direction you would like to see forum threads appear in. You can always change or disable this in the screen but your default will reset when the app re-launches. By default (or if set to None) the server will return results in the Descending direction.'
                }
                onSelect={handleSortDirection}
              />
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
