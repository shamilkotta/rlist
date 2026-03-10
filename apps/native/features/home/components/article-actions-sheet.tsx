import { Modal, Pressable, StyleSheet, Text } from 'react-native';

import type { DisplayArticle } from '@/features/home/home-feed.types';
import { useAppColors } from '@/hooks/use-theme';

type ArticleActionsSheetProps = {
  article: DisplayArticle | null;
  onClose: () => void;
  onToggleRead: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
};

export function ArticleActionsSheet({
  article,
  onClose,
  onToggleRead,
  onToggleArchive,
  onDelete,
}: ArticleActionsSheetProps) {
  const c = useAppColors();

  return (
    <Modal visible={Boolean(article)} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.actionSheet, { backgroundColor: c.background, borderColor: c.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Pressable
            style={[styles.actionItem, { borderBottomColor: c.border }]}
            onPress={onToggleRead}
          >
            <Text style={[styles.actionText, { color: c.text }]}>
              {article?.isRead ? 'Mark as unread' : 'Mark as read'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.actionItem, { borderBottomColor: c.border }]}
            onPress={onToggleArchive}
          >
            <Text style={[styles.actionText, { color: c.text }]}>
              {article?.isArchived ? 'Unarchive' : 'Archive'}
            </Text>
          </Pressable>
          <Pressable style={[styles.actionItem, styles.actionItemDanger]} onPress={onDelete}>
            <Text style={[styles.actionText, { color: c.error }]}>Delete</Text>
          </Pressable>
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
  actionSheet: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionItem: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionItemDanger: {
    borderBottomWidth: 0,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Geist-SemiBold',
  },
});
