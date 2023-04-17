import React from 'react';
import {FezPostData} from '../../../libraries/Structs/ControllerStructs';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {UserAvatarImage} from '../../Images/UserAvatarImage';
import {MessageView} from '../../Views/MessageView';
import {MessageViewContainer} from '../../Views/MessageViewContainer';
import {MessageSpacerView} from '../../Views/MessageSpacerView';
import {MessageAvatarContainerView} from '../../Views/MessageAvatarContainerView';
import {FlatListItemContent} from '../../Views/Content/FlatListItemContent';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useSeamailStack} from '../../Navigation/Stacks/SeamailStack';

// https://github.com/akveo/react-native-ui-kitten/issues/1167
interface FezPostListItemProps {
  item: FezPostData;
  index: number;
  separators: {
    highlight: () => void;
    unhighlight: () => void;
    updateProps: (select: 'leading' | 'trailing', newProps: any) => void;
  };
  showAuthor: boolean;
}

export const FezPostListItem = ({item, index, separators, showAuthor = true}: FezPostListItemProps) => {
  const {profilePublicData} = useUserData();
  const postBySelf = profilePublicData.header.userID === item.author.userID;
  const navigation = useSeamailStack();

  const onPress = () => {
    navigation.push(SeamailStackScreenComponents.userProfileScreen, {
      userID: item.author.userID,
      username: item.author.username,
    });
  };

  return (
    <FlatListItemContent>
      {!postBySelf && (
        <MessageAvatarContainerView onPress={onPress}>
          <UserAvatarImage userID={item.author.userID} small={true} />
        </MessageAvatarContainerView>
      )}
      {postBySelf && <MessageSpacerView />}
      <MessageViewContainer>
        <MessageView
          text={item.text}
          timestamp={item.timestamp}
          postBySelf={postBySelf}
          author={showAuthor ? item.author.username : undefined}
        />
      </MessageViewContainer>
      {!postBySelf && <MessageSpacerView />}
    </FlatListItemContent>
  );
};
