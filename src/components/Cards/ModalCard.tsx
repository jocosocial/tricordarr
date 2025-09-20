import React, {PropsWithChildren, ReactNode} from 'react';
import {Button, Card} from 'react-native-paper';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext';
import {useModal} from '#src/Components/Context/Contexts/ModalContext';
import {StyleSheet} from 'react-native';

interface ModalCardProps {
  title: string;
  content?: ReactNode;
  showCloseButton?: boolean;
  closeButtonText?: string;
  actions?: ReactNode;
}

/**
 * Generic component for a card displayed in a modal context. Commonly used for moderation reports.
 */
export const ModalCard = ({
  title,
  content,
  showCloseButton = true,
  closeButtonText = 'Close',
  actions,
  children,
}: PropsWithChildren<ModalCardProps>) => {
  const {commonStyles} = useStyles();
  const {setModalVisible} = useModal();

  const styles = StyleSheet.create({
    card: {
      ...commonStyles.secondaryContainer,
    },
    text: {
      ...commonStyles.marginBottomSmall,
    },
  });

  return (
    <Card style={styles.card}>
      <Card.Title titleVariant={'titleLarge'} title={title} />
      <Card.Content>
        {content}
        {children}
      </Card.Content>
      <Card.Actions>
        {actions}
        {showCloseButton && (
          <Button mode={'outlined'} onPress={() => setModalVisible(false)}>
            {closeButtonText}
          </Button>
        )}
      </Card.Actions>
    </Card>
  );
};
