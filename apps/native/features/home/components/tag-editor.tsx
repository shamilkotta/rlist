import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppColors } from '@/hooks/use-theme';

const MAX_TAGS = 2;
const TAG_MAX_LENGTH = 15;

type TagEditorProps = {
  articleId: string;
  initialTags: string[];
  activeTags?: string[];
  onUpdateTags: (articleId: string, tags: string[]) => void;
  onTagClick?: (tag: string) => void;
};

function normalizeTag(value: string): string {
  return value.trim().toUpperCase();
}

export function TagEditor({
  articleId,
  initialTags,
  activeTags = [],
  onUpdateTags,
  onTagClick,
}: TagEditorProps) {
  const c = useAppColors();
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  const persistTags = useCallback(
    (newTags: string[]) => {
      setTags(newTags);
      onUpdateTags(articleId, newTags);
    },
    [articleId, onUpdateTags]
  );

  const removeTag = useCallback(
    (tagToRemove: string) => {
      persistTags(tags.filter((tag) => tag !== tagToRemove));
    },
    [tags, persistTags]
  );

  const commitTagInput = useCallback(() => {
    const newTag = normalizeTag(tagInput);
    if (newTag && tags.length < MAX_TAGS && !tags.includes(newTag)) {
      persistTags([...tags, newTag]);
      setTagInput('');
    }
  }, [tagInput, tags, persistTags]);

  const handleChangeText = useCallback(
    (value: string) => {
      if (value.includes(',') || value.includes(' ')) {
        const newTag = normalizeTag(value.replace(/[,\s].*/, ''));
        if (newTag && tags.length < MAX_TAGS && !tags.includes(newTag)) {
          persistTags([...tags, newTag]);
        }
        setTagInput('');
      } else if (value.length <= TAG_MAX_LENGTH) {
        setTagInput(value);
      }
    },
    [tags, persistTags]
  );

  const handleSubmitEditing = useCallback(() => {
    commitTagInput();
  }, [commitTagInput]);

  const handleTagPress = useCallback(
    (tag: string) => {
      onTagClick?.(tag);
    },
    [onTagClick]
  );

  const handleRemoveTag = useCallback(
    (tag: string) => {
      removeTag(tag);
    },
    [removeTag]
  );

  const canAddTag = tags.length < MAX_TAGS;

  return (
    <View style={styles.container}>
      <View style={styles.tagsRow}>
        {tags.map((tag) => {
          const isActive = activeTags.includes(tag);
          return (
            <View
              key={tag}
              style={[
                styles.tagChip,
                {
                  borderColor: isActive ? c.tint : c.border,
                  backgroundColor: isActive ? `${c.tint}15` : 'transparent',
                },
              ]}
            >
              <Pressable onPress={() => handleTagPress(tag)} hitSlop={4}>
                <Text style={[styles.tagChipText, { color: isActive ? c.tint : c.text }]}>
                  {tag}
                </Text>
              </Pressable>
              <Pressable onPress={() => handleRemoveTag(tag)} hitSlop={4}>
                <Feather name="x" size={14} color={c.subtitle} />
              </Pressable>
            </View>
          );
        })}
        {canAddTag && (
          <TextInput
            style={[styles.addTagInput, { color: c.text }]}
            placeholder="Add tag..."
            placeholderTextColor={c.subtitle}
            value={tagInput}
            onChangeText={handleChangeText}
            onSubmitEditing={handleSubmitEditing}
            returnKeyType="done"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={TAG_MAX_LENGTH}
            blurOnSubmit={true}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
  },
  addTagInput: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Geist',
    minWidth: 70,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
});
