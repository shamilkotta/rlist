import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppColors } from '@/hooks/use-theme';

type DeleteArticleDialogProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteArticleDialog({ visible, onClose, onConfirm }: DeleteArticleDialogProps) {
  const c = useAppColors();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.confirmDialog, { backgroundColor: c.background, borderColor: c.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.confirmTitle, { color: c.text }]}>Delete article</Text>
          <Text style={[styles.confirmDescription, { color: c.subtitle }]}>
            This will remove the article from your list permanently.
          </Text>
          <View style={styles.confirmButtons}>
            <Pressable
              style={[styles.confirmCancelButton, { borderColor: c.border }]}
              onPress={onClose}
            >
              <Text style={[styles.confirmCancelText, { color: c.subtitle }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmDeleteButton, { backgroundColor: c.error }]}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmDeleteText, { color: '#ffffff' }]}>Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  confirmDialog: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
  },
  confirmDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Geist',
  },
  confirmButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  confirmCancelButton: {
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Geist-SemiBold',
  },
  confirmDeleteButton: {
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
  },
});
