import {PropsWithChildren} from 'react';
import {View} from 'react-native';

import {NavigationListItem} from '#src/Components/Lists/Items/NavigationListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface ModerationContentAuthorSectionViewProps extends PropsWithChildren {
  moderateUserID: string;
}

/**
 * Section of Moderation content screens showing actions available against the author.
 * @param moderateUserID - The user ID of the content author.
 * @param children - Additional screen-specific actions or content.
 */
export const ModerationContentAuthorSectionView = ({
  moderateUserID,
  children,
}: ModerationContentAuthorSectionViewProps) => {
  const navigation = useCommonStack();
  return (
    <View>
      <ListSection>
        <ListSubheader>Author</ListSubheader>
      </ListSection>
      {moderateUserID && (
        <NavigationListItem
          title={'Moderate User'}
          description={'Open the moderation screen for the content author.'}
          onPress={() => pushModerateResource(navigation, 'user', moderateUserID)}
        />
      )}
      {children}
    </View>
  );
};
