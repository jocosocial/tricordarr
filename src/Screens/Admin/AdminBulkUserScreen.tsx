import {File, Paths} from 'expo-file-system';
import React, {useState} from 'react';
import {Linking} from 'react-native';
import {Text} from 'react-native-paper';
import Share from 'react-native-share';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertApplyBulkUser} from '#src/Libraries/Alerts/AdminAlerts';
import {createLogger} from '#src/Libraries/Logger';
import {appSiteUrl} from '#src/Libraries/UrlParser';
import {
  useBulkUserApplyMutation,
  useBulkUserDownloadMutation,
  useBulkUserUploadMutation,
} from '#src/Queries/Admin/BulkUserMutations';
import {useBulkUserVerifyQuery} from '#src/Queries/Admin/BulkUserQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';
import {BulkUserUpdateCounts, BulkUserUpdateVerificationData} from '#src/Structs/AdminControllerStructs';

const logger = createLogger('AdminBulkUserScreen.tsx');

const isPickerCancelled = (error: unknown) => error instanceof Error && /cancell?ed/i.test(error.message);

export const AdminBulkUserScreen = () => {
  return (
    <AdminAccessScreen minAccess={'admin'}>
      <AdminBulkUserScreenInner />
    </AdminAccessScreen>
  );
};

const AdminBulkUserScreenInner = () => {
  const [uploaded, setUploaded] = useState(false);
  const {data, refetch, isLoading} = useBulkUserVerifyQuery({enabled: uploaded});
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const downloadMutation = useBulkUserDownloadMutation();
  const uploadMutation = useBulkUserUploadMutation();
  const applyMutation = useBulkUserApplyMutation();
  const {setSnackbarPayload} = useSnackbar();
  useAdminHelpButton();

  const handleDownload = () => {
    downloadMutation.mutate(undefined, {
      onSuccess: async buffer => {
        try {
          const fileName = `twitarr-users-${Math.floor(Date.now() / 1000)}.zip`;
          const file = new File(Paths.cache, fileName);
          file.create({intermediates: true, overwrite: true});
          file.write(new Uint8Array(buffer));
          await Share.open({
            url: file.uri,
            type: 'application/zip',
            filename: fileName,
            failOnCancel: false,
          });
        } catch (error) {
          if (isPickerCancelled(error) || (error instanceof Error && /did not share/i.test(error.message))) {
            return;
          }
          logger.error('Failed to share bulk user archive', error);
          setSnackbarPayload({message: `Could not share archive: ${error}`, messageType: 'error'});
        }
      },
    });
  };

  const handlePickUpload = async () => {
    try {
      const pick = await File.pickFileAsync({
        mimeTypes: ['application/zip', 'application/x-zip-compressed'],
      });
      if (pick.canceled || !pick.result) {
        return;
      }
      const buffer = await pick.result.arrayBuffer();
      uploadMutation.mutate(
        {data: buffer, filename: pick.result.name || 'users.zip'},
        {
          onSuccess: () => {
            setUploaded(true);
            setSnackbarPayload({message: 'Archive uploaded. Verify the result next.', messageType: 'success'});
            refetch();
          },
        },
      );
    } catch (error) {
      if (isPickerCancelled(error)) {
        return;
      }
      logger.error('Failed to pick bulk user archive', error);
      setSnackbarPayload({message: `Could not pick archive: ${error}`, messageType: 'error'});
    }
  };

  const handleApply = () => {
    alertApplyBulkUser(() =>
      applyMutation.mutate(undefined, {
        onSuccess: () => {
          setSnackbarPayload({message: 'Bulk user import applied.', messageType: 'success'});
          refetch();
        },
      }),
    );
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <Text>
            Download a zip of user records, or upload one and apply it. The server should be in admin-only mode before
            applying an import.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'bulkDownload-button'}
            buttonText={'Download User Archive'}
            onPress={handleDownload}
            isLoading={downloadMutation.isPending}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'bulkUpload-button'}
            buttonText={'Upload Zip'}
            onPress={handlePickUpload}
            isLoading={uploadMutation.isPending}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'bulkVerify-button'}
            buttonText={'Verify Uploaded Archive'}
            onPress={() => {
              setUploaded(true);
              refetch();
            }}
            disabled={uploadMutation.isPending}
            isLoading={isLoading && uploaded}
          />
        </PaddedContentView>
        {data && <BulkUserVerifySummary data={data} />}
        <PaddedContentView>
          <PrimaryActionButton
            testID={'bulkApply-button'}
            buttonText={'Apply Import'}
            onPress={handleApply}
            disabled={!data}
            isLoading={applyMutation.isPending}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'bulkWeb-button'}
            buttonText={'Open Web UI'}
            onPress={() => Linking.openURL(appSiteUrl('admin'))}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};

interface BulkUserVerifySummaryProps {
  data: BulkUserUpdateVerificationData;
}

const BulkUserVerifySummary = ({data}: BulkUserVerifySummaryProps) => {
  return (
    <>
      <ListSection>
        <ListSubheader>{data.changesApplied ? 'Applied Result' : 'Verification Preview'}</ListSubheader>
      </ListSection>
      <CountItems title={'Users'} counts={data.userCounts} />
      <CountItems title={'Performers'} counts={data.performerCounts} />
      <CountItems title={'Needs Photographer'} counts={data.needsPhotographerCounts} />
      {data.regCodeConflicts.length > 0 && (
        <DataFieldListItem title={'Reg Code Conflicts'} description={data.regCodeConflicts.join('\n')} />
      )}
      {data.usernameConflicts.length > 0 && (
        <DataFieldListItem title={'Username Conflicts'} description={data.usernameConflicts.join('\n')} />
      )}
      {data.errorNotImported.length > 0 && (
        <DataFieldListItem title={'Not Imported'} description={data.errorNotImported.join('\n')} />
      )}
      {data.otherErrors.length > 0 && (
        <DataFieldListItem title={'Other Errors'} description={data.otherErrors.join('\n')} />
      )}
    </>
  );
};

interface CountItemsProps {
  title: string;
  counts: BulkUserUpdateCounts;
}

const CountItems = ({title, counts}: CountItemsProps) => {
  return (
    <DataFieldListItem
      title={title}
      description={`Processed ${counts.totalRecordsProcessed}, imported ${counts.importedCount}, duplicates ${counts.duplicateCount}, errors ${counts.errorCount}`}
    />
  );
};
