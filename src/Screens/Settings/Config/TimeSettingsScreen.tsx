import {StackScreenProps} from '@react-navigation/stack';
import {Formik, FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {TimeSettingsForm} from '#src/Components/Forms/Settings/TimeSettingsForm';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {SettingsStackParamList, SettingsStackScreenComponents} from '#src/Navigation/Stacks/SettingsStackNavigator';
import {TimeSettingsFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.timeSettingsScreen>;

export const TimeSettingsScreen = ({navigation}: Props) => {
  const {appConfig, updateAppConfig} = useConfig();
  const {commonStyles} = useStyles();
  const [forceShowTimezoneWarning, setForceShowTimezoneWarning] = useState(appConfig.forceShowTimezoneWarning);
  const {cruiseDayToday, adjustedCruiseDayToday, cruiseDayIndex, adjustedCruiseDayIndex} = useCruise();

  const onSubmit = (values: TimeSettingsFormValues, helpers: FormikHelpers<TimeSettingsFormValues>) => {
    updateAppConfig({
      ...appConfig,
      manualTimeOffset: Number(values.manualTimeOffset),
    });
    helpers.setSubmitting(false);
  };

  const toggleForceShowTimezoneWarning = () => {
    const newValue = !forceShowTimezoneWarning;
    updateAppConfig({
      ...appConfig,
      forceShowTimezoneWarning: newValue,
    });
    setForceShowTimezoneWarning(newValue);
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => {
              navigation.push(CommonStackComponents.timeZoneHelpScreen);
            }}
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

  const initialValues: TimeSettingsFormValues = {manualTimeOffset: appConfig.manualTimeOffset.toString()};
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSection>
          <ListSubheader>Offset</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <TimeSettingsForm onSubmit={onSubmit} initialValues={initialValues} />
        </PaddedContentView>
        {appConfig.enableDeveloperOptions && (
          <>
            <ListSubheader>Date Internals</ListSubheader>
            <DataFieldListItem title={'Cruise Day Today'} description={cruiseDayToday.toString()} />
            <DataFieldListItem title={'Adjusted Cruise Day Today'} description={adjustedCruiseDayToday.toString()} />
            <DataFieldListItem title={'Cruise Day Index'} description={cruiseDayIndex.toString()} />
            <DataFieldListItem title={'Adjusted Cruise Day Index'} description={adjustedCruiseDayIndex.toString()} />
            <ListSection>
              <ListSubheader>Developer Options</ListSubheader>
            </ListSection>
            <Formik initialValues={{}} onSubmit={() => {}}>
              <View>
                <BooleanField
                  name={'forceShowTimezoneWarning'}
                  label={'Force Show Timezone Warning'}
                  onPress={toggleForceShowTimezoneWarning}
                  value={forceShowTimezoneWarning}
                  helperText={'Always show the timezone warning on the Today screen.'}
                  style={commonStyles.paddingHorizontalSmall}
                />
              </View>
            </Formik>
          </>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
