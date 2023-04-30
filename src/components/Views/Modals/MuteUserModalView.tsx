import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {UserAccessLevel} from '../../../libraries/Enums/UserAccessLevel';
import {ModalCard} from '../../Cards/ModalCard';
import {useModal} from '../../Context/Contexts/ModalContext';
import {useUserMuteMutation} from '../../Queries/Users/UserMuteQueries';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../styles/Theme';
import {useUserRelations} from '../../Context/Contexts/UserRelationsContext';
import {AppIcon} from '../../Images/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';

interface MuteUserModalViewProps {
  user: UserHeader;
}

const MuteUserModalContent = () => {
  const {commonStyles, styleDefaults} = useStyles();
  const {accessLevel} = useUserData();
  return (
    <>
      <Text style={[commonStyles.marginBottomSmall]}>Muting a user will hide all that user's content from you.</Text>
      {UserAccessLevel.hasAccess(accessLevel, UserAccessLevel.moderator) && (
        <>
          <Text style={[commonStyles.marginBottomSmall]}>
            <AppIcon icon={AppIcons.moderator} size={styleDefaults.fontSize} />
            &nbsp; You're a Moderator. You'll still see their content.
          </Text>
        </>
      )}
    </>
  );
};

export const MuteUserModalView = ({user}: MuteUserModalViewProps) => {
  const muteMutation = useUserMuteMutation();
  const {setErrorMessage} = useErrorHandler();
  const {setModalVisible} = useModal();
  const theme = useAppTheme();
  const {mutes, setMutes} = useUserRelations();

  const onSubmit = () => {
    muteMutation.mutate(
      {
        userID: user.userID,
        action: 'mute',
      },
      {
        onSuccess: () => {
          setMutes(mutes.concat([user]));
          setModalVisible(false);
        },
        onError: error => {
          setErrorMessage(error.response?.data.reason);
        },
      },
    );
  };

  const cardActions = (
    <PrimaryActionButton
      buttonColor={theme.colors.twitarrNegativeButton}
      buttonText={'Mute'}
      onPress={onSubmit}
      isLoading={muteMutation.isLoading}
      disabled={muteMutation.isLoading}
    />
  );

  return (
    <View>
      <ModalCard title={'Mute'} closeButtonText={'Cancel'} content={<MuteUserModalContent />} actions={cardActions} />
    </View>
  );
};
