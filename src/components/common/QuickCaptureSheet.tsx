import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Input } from './Input';
import { Button } from './Button';
import {
  NoteIcon,
  TaskIcon,
  FinanceIcon,
  HeartIcon,
  BellIcon,
} from '../icons';
import {
  JournalTileIcon,
  NotesTileIcon,
  HaircareTileIcon,
  SkincareTileIcon,
  ShoppingTileIcon,
  TasksTileIcon,
} from '../illustrations';
import {
  notesRepository,
  tasksRepository,
  financeRepository,
  productsRepository,
  moodRepository,
} from '../../database/repositories';

export type CaptureOption =
  | 'note'
  | 'expense'
  | 'task'
  | 'product'
  | 'journal'
  | 'reminder';

interface QuickCaptureSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialType?: CaptureOption;
}

export function QuickCaptureSheet({
  visible,
  onClose,
  onSuccess,
  initialType = 'note',
}: QuickCaptureSheetProps) {
  const [selectedType, setSelectedType] = useState<CaptureOption>(initialType);

  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Personal');
  const [brand, setBrand] = useState('');

  const resetForm = () => {
    setTitle('');
    setContent('');
    setAmount('');
    setBrand('');
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    if (selectedType === 'note') {
      notesRepository.create({
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
      });
    } else if (selectedType === 'journal') {
      notesRepository.create({
        title: title.trim() || `Journal: ${new Date().toLocaleDateString()}`,
        content: content.trim(),
        collectionId: 'col-personal',
      });
    } else if (selectedType === 'task') {
      tasksRepository.create({
        title: title.trim(),
        priority: 'B',
      });
    } else if (selectedType === 'expense') {
      const val = parseFloat(amount) || 0;
      financeRepository.create({
        type: 'expense',
        amount: val,
        category: category || 'General',
        description: title.trim(),
        date: new Date().toISOString().split('T')[0],
      });
    } else if (selectedType === 'product') {
      productsRepository.create({
        name: title.trim(),
        brand: brand.trim() || undefined,
        category: 'skincare',
        purchaseStatus: 'wishlisted',
      });
    } else if (selectedType === 'reminder') {
      tasksRepository.create({
        title: `Reminder: ${title.trim()}`,
        priority: 'A',
      });
    }

    resetForm();
    onClose();
    onSuccess?.();
  };

  const CAPTURE_OPTIONS: { type: CaptureOption; label: string; icon: React.ReactNode }[] = [
    { type: 'note', label: 'Note', icon: <NotesTileIcon size={28} /> },
    { type: 'journal', label: 'Journal', icon: <JournalTileIcon size={28} /> },
    { type: 'task', label: 'Task', icon: <TasksTileIcon size={28} /> },
    { type: 'expense', label: 'Expense', icon: <FinanceIcon size={22} color="#C58882" /> },
    { type: 'product', label: 'Product', icon: <ShoppingTileIcon size={28} /> },
    { type: 'reminder', label: 'Reminder', icon: <BellIcon size={22} color="#E8B36F" /> },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Quick Capture">
      <View style={styles.container}>
        {/* Horizontal Action Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorRow}
        >
          {CAPTURE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.type}
              onPress={() => setSelectedType(opt.type)}
              style={[
                styles.optionButton,
                selectedType === opt.type && styles.activeOptionButton,
              ]}
            >
              <View style={styles.optionIconContainer}>{opt.icon}</View>
              <Text
                style={[
                  styles.optionLabel,
                  selectedType === opt.type && styles.activeOptionLabel,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Dynamic Input Form */}
        <Input
          label={
            selectedType === 'expense'
              ? 'What did you buy?'
              : selectedType === 'product'
              ? 'Product Name'
              : selectedType === 'task'
              ? 'Task to accomplish'
              : 'Title'
          }
          placeholder={
            selectedType === 'note'
              ? 'e.g. Rosemary oil scalp notes'
              : selectedType === 'expense'
              ? 'e.g. Facial Cleanser'
              : selectedType === 'task'
              ? 'e.g. Apply hair mask tonight'
              : selectedType === 'product'
              ? 'e.g. Ceramide Barrier Cream'
              : 'Write here...'
          }
          value={title}
          onChangeText={setTitle}
        />

        {selectedType === 'expense' && (
          <Input
            label="Amount (NPR)"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        )}

        {selectedType === 'product' && (
          <Input
            label="Brand (optional)"
            placeholder="e.g. The Ordinary, Minimalist"
            value={brand}
            onChangeText={setBrand}
          />
        )}

        {(selectedType === 'note' || selectedType === 'journal') && (
          <Input
            label="Details / Reflection"
            placeholder="Add your thoughts or instructions..."
            value={content}
            onChangeText={setContent}
            multiline
          />
        )}

        <Button
          title={`Save ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`}
          onPress={handleSave}
          fullWidth
          size="medium"
          style={{ marginTop: 8 }}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  selectorRow: {
    gap: 10,
    marginBottom: 18,
    paddingVertical: 2,
  },
  optionButton: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FAF8F4',
    borderWidth: 1.5,
    borderColor: '#EEEAE5',
    minWidth: 74,
  },
  activeOptionButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C58882',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIconContainer: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#88827E',
    marginTop: 4,
  },
  activeOptionLabel: {
    color: '#34312F',
    fontWeight: '700',
  },
});

