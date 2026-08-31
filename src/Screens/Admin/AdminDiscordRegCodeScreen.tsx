import {Formik} from 'formik';
import React from 'react';
import {useState} from 'react';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {formatRegCodeDisplay} from '#src/Libraries/StringUtils';
import {useAllocateDiscordRegCodeMutation} from '#src/Queries/Admin/DiscordRegCodeMutations';
import {useRegCodeStatsQuery} from '#src/Queries/Admin/RegCodeQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';
import {RegistrationCodeUserData} from '#src/Structs/ControllerStructs';

export const AdminDiscordRegCodeScreen = () => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminDiscordRegCodeScreenInner />
    </AdminAccessScreen>
  );
};

const AdminDiscordRegCodeScreenInner = () => {
  const {data: stats} = useRegCodeStatsQuery();
  const mutation = useAllocateDiscordRegCodeMutation();
  const {setSnackbarPayload} = useSnackbar();
  const [result, setResult] = useState<RegistrationCodeUserData>();
  useAdminHelpButton();

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <Text>
            Allocate a pre-prod registration code to a Discord username. Production servers typically have zero Discord
            codes.
          </Text>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Discord Codes</ListSubheader>
        </ListSection>
        <DataFieldListItem title={'Allocated'} description={stats?.allocatedDiscordCodes} />
        <DataFieldListItem title={'Assigned'} description={stats?.assignedDiscordCodes} />
        <DataFieldListItem title={'Used'} description={stats?.usedDiscordCodes} />
        <PaddedContentView padTop={true}>
          <Formik
            initialValues={{discordUsername: ''}}
            onSubmit={(values, helpers) => {
              mutation.mutate(values.discordUsername, {
                onSuccess: data => {
                  setResult(data);
                  setSnackbarPayload({message: 'Registration code allocated.', messageType: 'success'});
                },
                onSettled: () => helpers.setSubmitting(false),
              });
            }}>
            {({handleSubmit, isSubmitting}) => (
              <>
                <DirtyDetectionField />
                <TextField
                  name={'discordUsername'}
                  testID={'discordUsername-field'}
                  label={'Discord Username'}
                  autoCapitalize={'none'}
                />
                <PrimaryActionButton
                  testID={'allocateDiscord-button'}
                  buttonText={'Allocate'}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  isLoading={mutation.isPending}
                />
              </>
            )}
          </Formik>
        </PaddedContentView>
        {result && <DataFieldListItem title={'Assigned Code'} description={formatRegCodeDisplay(result.regCode)} />}
      </ScrollingContentView>
    </AppView>
  );
};
