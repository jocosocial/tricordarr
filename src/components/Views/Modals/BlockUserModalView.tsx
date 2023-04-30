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
import {useUserBlockMutation} from '../../Queries/Users/UserBlockQueries';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../styles/Theme';
import {useUserRelations} from '../../Context/Contexts/UserRelationsContext';
import {AppIcon} from '../../Images/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';

interface BlockUserModalViewProps {
  user: UserHeader;
}

const BlockUserModalContent = () => {
  const {commonStyles, styleDefaults} = useStyles();
  const {accessLevel} = useUserData();
  return (
    <>
      <Text style={[commonStyles.marginBottomSmall]}>
        Blocking a user will hide all that user's content from you, and also hide all your content from them.
      </Text>
      {UserAccessLevel.hasAccess(accessLevel, UserAccessLevel.moderator) && (
        <>
          <Text style={[commonStyles.marginBottomSmall]}>
            <AppIcon icon={AppIcons.moderator} size={styleDefaults.fontSize} />
            &nbsp; You're a Moderator. You'll still see their content.
            Blocking does hide your non-Mod alt accounts from this person, and vice-versa.
          </Text>
        </>
      )}
    </>
  );
};

export const BlockUserModalView = ({user}: BlockUserModalViewProps) => {
  const blockMutation = useUserBlockMutation();
  const {setErrorMessage} = useErrorHandler();
  const {setModalVisible} = useModal();
  const theme = useAppTheme();
  const {blocks, setBlocks} = useUserRelations();

  const onSubmit = () => {
    blockMutation.mutate(
      {
        userID: user.userID,
        action: 'block',
      },
      {
        onSuccess: () => {
          setBlocks(blocks.concat([user]));
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
      buttonText={'Block'}
      onPress={onSubmit}
      isLoading={blockMutation.isLoading}
      disabled={blockMutation.isLoading}
    />
  );

  return (
    <View>
      <ModalCard title={'Block'} closeButtonText={'Cancel'} content={<BlockUserModalContent />} actions={cardActions} />
    </View>
  );
};
