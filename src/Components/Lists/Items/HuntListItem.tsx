import React, {memo, useCallback} from 'react';

import {ListItem} from '#src/Components/Lists/ListItem';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {HuntListItemData} from '#src/Structs/ControllerStructs';

interface HuntListItemProps {
  hunt: HuntListItemData;
}

/**
 * Row for a hunt in the puzzle hunt catalog. Matches the Swiftarr list, which shows title only.
 */
const HuntListItemInternal = ({hunt}: HuntListItemProps) => {
  const {commonStyles} = useStyles();
  const navigation = useCommonStack();

  const onPress = useCallback(() => {
    navigation.push(CommonStackComponents.huntScreen, {huntID: hunt.huntID});
  }, [hunt.huntID, navigation]);

  return <ListItem title={hunt.title} titleStyle={commonStyles.bold} onPress={onPress} />;
};

export const HuntListItem = memo(HuntListItemInternal);
