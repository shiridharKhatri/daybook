import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { haptic } from '../../utils/haptics';
import { BottomSheet, Input, Button, Badge, GlassView } from '../../components/common';
import {
  PlusIcon,
  CheckIcon,
  TrashIcon,
  RotateCcwIcon,
  CalendarIcon,
  SendArrowIcon,
} from '../../components/icons';
import {
  tasksRepository,
  habitsRepository,
  TaskItem,
  HabitItem,
} from '../../database/repositories';

const RITUAL_ICONS: { key: string; name: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'heart', name: 'Self-Care', icon: 'heart-outline' },
  { key: 'leaf', name: 'Herbal', icon: 'leaf' },
  { key: 'water', name: 'Hydration', icon: 'water-outline' },
  { key: 'book', name: 'Reading', icon: 'book-open-outline' },
  { key: 'sun', name: 'Morning', icon: 'white-balance-sunny' },
  { key: 'moon', name: 'Evening', icon: 'moon-waning-crescent' },
  { key: 'pill', name: 'Vitamins', icon: 'pill' },
  { key: 'flower', name: 'Beauty', icon: 'flower-tulip-outline' },
  { key: 'walk', name: 'Movement', icon: 'walk' },
  { key: 'coffee', name: 'Tea/Coffee', icon: 'coffee-outline' },
];

const RITUAL_COLORS = [
  { label: 'Dusty Rose', hex: '#C58882' },
  { label: 'Soft Sage', hex: '#8DB580' },
  { label: 'Sky Blue', hex: '#8BB0C4' },
  { label: 'Amber Honey', hex: '#E8B36F' },
  { label: 'Soft Lilac', hex: '#B4A7D6' },
  { label: 'Warm Peach', hex: '#E9C5BE' },
];

const RITUAL_PRESETS = [
  { name: 'Rosemary Hair Oil', icon: 'leaf', color: '#8DB580' },
  { name: 'Morning Skincare', icon: 'heart', color: '#C58882' },
  { name: 'Drink 2L Water', icon: 'water', color: '#8BB0C4' },
  { name: '5-min Stillness', icon: 'sun', color: '#E8B36F' },
  { name: 'Evening Reflection', icon: 'book', color: '#B4A7D6' },
  { name: 'Magnesium / Vitamins', icon: 'pill', color: '#C58882' },
  { name: 'Gentle Stretches', icon: 'walk', color: '#8DB580' },
  { name: 'Warm Herbal Tea', icon: 'coffee', color: '#E8B36F' },
];

function HabitIconBadge({ icon, color, size = 14 }: { icon: string | null; color: string; size?: number }) {
  const match = RITUAL_ICONS.find((i) => i.key === icon) || { icon: 'spa-outline' as const };
  return <MaterialCommunityIcons name={match.icon as any} size={size} color={color} />;
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [aiQuickInput, setAiQuickInput] = useState('');
  const [aiOptimizedNotice, setAiOptimizedNotice] = useState<string | null>(null);

  // New task sheet state (for detailed creation)
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Daily Ritual Customizer state
  const [showHabitSheet, setShowHabitSheet] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [habitName, setHabitName] = useState('');
  const [habitIcon, setHabitIcon] = useState('heart');
  const [habitColor, setHabitColor] = useState('#C58882');

  const loadData = useCallback(() => {
    const allTasks = tasksRepository.getAll({
      status: filter === 'all' ? undefined : filter,
      priority: selectedPriority === 'all' ? undefined : selectedPriority,
    });
    setTasks(allTasks);
    setHabits(habitsRepository.getAllWithTodayStatus());
  }, [filter, selectedPriority]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    haptic.selection();
    loadData();
    setTimeout(() => setRefreshing(false), 300);
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const pendingTasks = useMemo(() => tasks.filter((t) => t.status !== 'completed'), [tasks]);
  const highPriorityCount = useMemo(() => pendingTasks.filter((t) => t.priority === 'A').length, [pendingTasks]);

  const handleToggleTask = (task: TaskItem) => {
    haptic.success();
    const isNowCompleted = task.status !== 'completed';
    tasksRepository.toggleComplete(task.id, isNowCompleted);
    loadData();
  };

  const handleDeleteTask = (id: string) => {
    haptic.medium();
    tasksRepository.delete(id);
    loadData();
  };

  const handleToggleHabit = (habitItem: HabitItem) => {
    haptic.success();
    habitsRepository.toggleToday(habitItem.id, !habitItem.isCompletedToday);
    loadData();
  };

  const handleOpenAddHabit = () => {
    haptic.selection();
    setEditingHabitId(null);
    setHabitName('');
    setHabitIcon('heart');
    setHabitColor('#C58882');
    setShowHabitSheet(true);
  };

  const handleOpenEditHabit = (h: HabitItem) => {
    haptic.selection();
    setEditingHabitId(h.id);
    setHabitName(h.name);
    setHabitIcon(h.icon || 'heart');
    setHabitColor(h.color || '#C58882');
    setShowHabitSheet(true);
  };

  const handleSaveHabit = () => {
    const trimmed = habitName.trim();
    if (!trimmed) {
      Alert.alert('Name Required', 'Please enter a name for your ritual.');
      return;
    }
    haptic.success();
    if (editingHabitId) {
      habitsRepository.update(editingHabitId, {
        name: trimmed,
        icon: habitIcon,
        color: habitColor,
      });
    } else {
      habitsRepository.create({
        name: trimmed,
        icon: habitIcon,
        color: habitColor,
      });
    }
    setShowHabitSheet(false);
    loadData();
  };

  const handleDeleteHabit = (id: string) => {
    Alert.alert(
      'Remove Ritual',
      'Are you sure you want to remove this ritual?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            haptic.medium();
            habitsRepository.delete(id);
            setShowHabitSheet(false);
            loadData();
          },
        },
      ]
    );
  };

  // Natural language parsing for AI Quick Task Capture
  const handleAiQuickAdd = () => {
    const raw = aiQuickInput.trim();
    if (!raw) return;

    haptic.impact();
    const lower = raw.toLowerCase();

    // Detect priority
    let priority: 'A' | 'B' | 'C' | 'D' = 'B';
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('priority a') || lower.includes('critical') || lower.includes('important')) {
      priority = 'A';
    } else if (lower.includes('low') || lower.includes('someday') || lower.includes('priority d') || lower.includes('maybe')) {
      priority = 'D';
    } else if (lower.includes('whenever') || lower.includes('priority c') || lower.includes('routine')) {
      priority = 'C';
    }

    // Detect due date
    let dueDate: string | null = null;
    const now = new Date();
    if (lower.includes('today')) {
      dueDate = now.toISOString().split('T')[0];
    } else if (lower.includes('tomorrow')) {
      const tmr = new Date(now.getTime() + 86400000);
      dueDate = tmr.toISOString().split('T')[0];
    }

    // Clean title
    let cleanTitle = raw
      .replace(/\b(urgent|asap|priority a|priority b|priority c|priority d|critical|important|today|tomorrow)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanTitle) cleanTitle = raw;

    tasksRepository.create({
      title: cleanTitle,
      priority,
      dueDate,
    });

    setAiQuickInput('');
    setAiOptimizedNotice(`AI extracted: "${cleanTitle}" [Priority ${priority}]`);
    setTimeout(() => setAiOptimizedNotice(null), 3000);
    loadData();
  };

  const handleAiPlanDay = () => {
    haptic.impact();
    // Sort tasks smartly by Priority A -> B -> C -> D
    setSelectedPriority('all');
    setFilter('pending');
    loadData();
    Alert.alert(
      'AI Day Sequence Planned',
      `Arranged your day with ${highPriorityCount} critical Priority A focus items first. Best completion window is before 2:00 PM.`,
      [{ text: 'Got it' }]
    );
  };

  const handleAiBreakdownTask = (task: TaskItem) => {
    haptic.impact();
    Alert.alert(
      `AI Breakdown: ${task.title}`,
      `Suggested sequence:\n1. Prepare required tools or notes\n2. Execute 20-min focused session\n3. Review & check off`,
      [
        { text: 'Done', style: 'cancel' },
        {
          text: 'Add Sub-tasks',
          onPress: () => {
            tasksRepository.create({
              title: `Step 1: Prep for ${task.title}`,
              priority: task.priority,
              dueDate: task.dueDate,
            });
            tasksRepository.create({
              title: `Step 2: Complete ${task.title}`,
              priority: task.priority,
              dueDate: task.dueDate,
            });
            loadData();
          },
        },
      ]
    );
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    tasksRepository.create({
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      dueDate: newTaskDueDate.trim() || null,
    });
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setShowAddSheet(false);
    loadData();
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'A':
        return '#D4736C';
      case 'B':
        return '#E8B36F';
      case 'C':
        return '#8BB0C4';
      default:
        return '#B5AFA8';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tasks & Habits</Text>
          <Text style={styles.headerSub}>Daily Flow & Rituals</Text>
        </View>

        <Pressable
          onPress={() => setShowAddSheet(true)}
          style={({ pressed }) => [
            styles.aiPlanButton,
            pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
          ]}
        >
          <PlusIcon size={14} color="#34312F" strokeWidth={2.2} />
          <Text style={styles.aiPlanButtonText}>New Task</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C58882"
          />
        }
      >
        {/* Daily Focus Card */}
        <View style={styles.aiBriefCard}>
          <View style={styles.aiBriefTop}>
            <View style={styles.aiBriefBadge}>
              <Text style={styles.aiBriefBadgeText}>Daily Focus</Text>
            </View>
            <Text style={styles.aiBriefCounter}>
              {pendingTasks.length} pending
            </Text>
          </View>

          <Text style={styles.aiBriefHeading}>
            {highPriorityCount > 0
              ? `${highPriorityCount} Priority A items require your morning energy.`
              : 'Your schedule is well balanced for steady flow.'}
          </Text>

          <Text style={styles.aiBriefBody}>
            {pendingTasks.length > 0
              ? 'Sequence: Complete critical items first, then lock in your daily habit streaks before evening.'
              : 'Everything is up to date! Great momentum to maintain your wellness rituals.'}
          </Text>

          {/* Quick Actions */}
          <View style={styles.aiActionsRow}>
            <Pressable
              onPress={handleAiPlanDay}
              style={({ pressed }) => [
                styles.aiActionChip,
                pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.aiActionChipText}>Prioritize A→D</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowAddSheet(true)}
              style={({ pressed }) => [
                styles.aiActionChip,
                pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
              ]}
            >
              <PlusIcon size={13} color="#34312F" />
              <Text style={styles.aiActionChipText}>Detailed Task</Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Task Capture Bar */}
        <View style={styles.aiCaptureWrapper}>
          <GlassView
            cornerRadius={24}
            variant="regular"
            tint="rgba(255, 255, 255, 0.88)"
            style={styles.aiCaptureCapsule}
          >
            <PlusIcon size={15} color="#88827E" strokeWidth={2} />
            <TextInput
              placeholder="Quick add: 'Rosemary scalp oil tomorrow Priority A'..."
              placeholderTextColor="#A8A29E"
              value={aiQuickInput}
              onChangeText={setAiQuickInput}
              onSubmitEditing={handleAiQuickAdd}
              returnKeyType="done"
              style={styles.aiCaptureInput}
            />
            {aiQuickInput.trim().length > 0 ? (
              <Pressable
                onPress={handleAiQuickAdd}
                style={({ pressed }) => [
                  styles.aiCaptureSendBtn,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.94 }] },
                ]}
              >
                <SendArrowIcon size={14} color="#FFFFFF" />
              </Pressable>
            ) : null}
          </GlassView>

          {aiOptimizedNotice && (
            <Text style={styles.aiOptimizedNotice}>{aiOptimizedNotice}</Text>
          )}
        </View>

        {/* Daily Rituals (Habits) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Daily Rituals</Text>
              <Text style={styles.sectionSubtitle}>
                {habits.filter((h) => h.isCompletedToday).length}/{habits.length} completed
              </Text>
            </View>
            <Pressable
              onPress={handleOpenAddHabit}
              hitSlop={8}
              style={({ pressed }) => [
                styles.customizeRitualBtn,
                pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
              ]}
            >
              <PlusIcon size={12} color="#C58882" strokeWidth={2.4} />
              <Text style={styles.customizeRitualBtnText}>Custom Ritual</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.habitsScroll}
          >
            {habits.map((h) => {
              const cardAccent = h.color || '#C58882';
              return (
                <Pressable
                  key={h.id}
                  onPress={() => handleToggleHabit(h)}
                  onLongPress={() => handleOpenEditHabit(h)}
                  style={({ pressed }) => [
                    styles.habitCard,
                    h.isCompletedToday && {
                      borderColor: cardAccent,
                      backgroundColor: '#FCFAF8',
                    },
                    pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
                  ]}
                >
                  <View style={styles.habitTopRow}>
                    <Pressable
                      hitSlop={8}
                      onPress={() => handleToggleHabit(h)}
                      style={[
                        styles.habitCheckCircle,
                        h.isCompletedToday && {
                          backgroundColor: cardAccent,
                          borderColor: cardAccent,
                        },
                      ]}
                    >
                      {h.isCompletedToday && <CheckIcon size={12} color="#FFFFFF" strokeWidth={2.8} />}
                    </Pressable>

                    <View style={styles.habitBadgeGroup}>
                      <View style={[styles.habitIconCircle, { backgroundColor: cardAccent + '1A' }]}>
                        <HabitIconBadge icon={h.icon} color={cardAccent} size={13} />
                      </View>
                      <View style={styles.streakBadge}>
                        <Text style={styles.streakBadgeText}>{h.streakCount}d</Text>
                      </View>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.habitName,
                      h.isCompletedToday && styles.completedHabitName,
                    ]}
                    numberOfLines={1}
                  >
                    {h.name}
                  </Text>

                  <View style={styles.habitCardFooter}>
                    <Text style={styles.habitSub}>Daily ritual</Text>
                    <Pressable
                      hitSlop={10}
                      onPress={() => handleOpenEditHabit(h)}
                      style={styles.habitDotsBtn}
                    >
                      <MaterialCommunityIcons name="dots-horizontal" size={15} color="#A8A29E" />
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}

            {/* "+ Add Ritual" card */}
            <Pressable
              onPress={handleOpenAddHabit}
              style={({ pressed }) => [
                styles.newRitualCard,
                pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
              ]}
            >
              <View style={styles.newRitualIconCircle}>
                <PlusIcon size={16} color="#C58882" strokeWidth={2.2} />
              </View>
              <Text style={styles.newRitualCardTitle}>Add Ritual</Text>
              <Text style={styles.newRitualCardSub}>Custom care</Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Task Filters & Segmented Control */}
        <View style={styles.filtersContainer}>
          <View style={styles.statusFilters}>
            {(['pending', 'completed', 'all'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => {
                  haptic.selection();
                  setFilter(s);
                }}
                style={[
                  styles.statusTab,
                  filter === s && styles.activeStatusTab,
                ]}
              >
                <Text
                  style={[
                    styles.statusTabText,
                    filter === s && styles.activeStatusTabText,
                  ]}
                >
                  {s === 'pending' ? 'To Do' : s === 'completed' ? 'Done' : 'All Tasks'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Priority Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.priorityFilterScroll}
          >
            {['all', 'A', 'B', 'C', 'D'].map((p) => {
              const isActive = selectedPriority === p;
              const pColor = getPriorityColor(p);
              return (
                <Pressable
                  key={p}
                  onPress={() => {
                    haptic.selection();
                    setSelectedPriority(p);
                  }}
                  style={[
                    styles.priorityChip,
                    isActive && styles.activePriorityChip,
                  ]}
                >
                  {p !== 'all' && (
                    <View style={[styles.priorityDot, { backgroundColor: pColor }]} />
                  )}
                  <Text
                    style={[
                      styles.priorityChipText,
                      isActive && styles.activePriorityChipText,
                    ]}
                  >
                    {p === 'all' ? 'All Priorities' : `Priority ${p}`}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Task List */}
        <View style={styles.taskListSection}>
          {tasks.length > 0 ? (
            tasks.map((task) => {
              const isDone = task.status === 'completed';
              const pColor = getPriorityColor(task.priority);

              return (
                <Pressable
                  key={task.id}
                  onPress={() => handleToggleTask(task)}
                  style={({ pressed }) => [
                    styles.taskCard,
                    isDone && styles.taskCardCompleted,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
                  ]}
                >
                  {/* Left Checkbox */}
                  <View
                    style={[
                      styles.checkbox,
                      isDone && styles.checkboxCompleted,
                    ]}
                  >
                    {isDone && <CheckIcon size={13} color="#FFFFFF" strokeWidth={3} />}
                  </View>

                  {/* Center Details */}
                  <View style={styles.taskDetails}>
                    <Text
                      style={[
                        styles.taskTitle,
                        isDone && styles.taskTitleCompleted,
                      ]}
                      numberOfLines={2}
                    >
                      {task.title}
                    </Text>

                    <View style={styles.taskMetaRow}>
                      {task.dueDate && (
                        <View style={styles.dueBadge}>
                          <CalendarIcon size={12} color="#88827E" />
                          <Text style={styles.dueBadgeText}>{task.dueDate}</Text>
                        </View>
                      )}

                      {!isDone && (
                        <Pressable
                          onPress={() => handleAiBreakdownTask(task)}
                          hitSlop={8}
                          style={styles.aiBreakdownLink}
                        >
                          <Text style={styles.aiBreakdownText}>Break down</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>

                  {/* Priority Badge */}
                  <View style={[styles.taskPriorityPill, { backgroundColor: pColor + '18' }]}>
                    <Text style={[styles.taskPriorityText, { color: pColor }]}>
                      {task.priority}
                    </Text>
                  </View>

                  {/* Delete Button */}
                  <Pressable
                    onPress={() => handleDeleteTask(task.id)}
                    hitSlop={12}
                    style={styles.deleteButton}
                  >
                    <TrashIcon size={16} color="#B5AFA8" />
                  </Pressable>
                </Pressable>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <CheckIcon size={22} color="#C58882" strokeWidth={2} />
              </View>
              <Text style={styles.emptyTitle}>
                {filter === 'completed' ? 'No completed tasks yet' : 'No pending tasks!'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'completed'
                  ? 'Check off items as you finish them.'
                  : 'Add a new task above or ask your Assistant to generate your plan.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Detailed Task Bottom Sheet */}
      <BottomSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        title="Add Detailed Task"
      >
        <View style={styles.sheetContent}>
          <Input
            label="Task Name"
            placeholder="e.g. Schedule scalp treatment appointment"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
          />

          <Text style={styles.inputLabel}>Priority Level</Text>
          <View style={styles.prioritySelectorRow}>
            {(['A', 'B', 'C', 'D'] as const).map((p) => {
              const isSelected = newTaskPriority === p;
              const pColor = getPriorityColor(p);
              return (
                <Pressable
                  key={p}
                  onPress={() => {
                    haptic.selection();
                    setNewTaskPriority(p);
                  }}
                  style={[
                    styles.priorityButton,
                    isSelected && {
                      backgroundColor: pColor,
                      borderColor: pColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      isSelected && { color: '#FFFFFF' },
                    ]}
                  >
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Input
            label="Due Date (optional)"
            placeholder="YYYY-MM-DD (e.g. 2026-11-08)"
            value={newTaskDueDate}
            onChangeText={setNewTaskDueDate}
          />

          <Button
            title="Create Task"
            onPress={handleCreateTask}
            fullWidth
            size="medium"
          />
        </View>
      </BottomSheet>

      {/* Daily Ritual Customizer Bottom Sheet */}
      <BottomSheet
        visible={showHabitSheet}
        onClose={() => setShowHabitSheet(false)}
        title={editingHabitId ? 'Customize Ritual' : 'New Daily Ritual'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          {/* Quick Presets (when creating new) */}
          {!editingHabitId && (
            <View style={styles.presetSection}>
              <Text style={styles.presetSectionLabel}>Suggested Self-Care Rituals</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetScroll}
              >
                {RITUAL_PRESETS.map((p, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      haptic.selection();
                      setHabitName(p.name);
                      setHabitIcon(p.icon);
                      setHabitColor(p.color);
                    }}
                    style={styles.presetChip}
                  >
                    <HabitIconBadge icon={p.icon} color={p.color} size={13} />
                    <Text style={styles.presetChipText}>{p.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Ritual Name Input */}
          <Input
            label="Ritual Name"
            placeholder="e.g. Rosemary Hair Oil, 10-min Read, Vitamin D"
            value={habitName}
            onChangeText={setHabitName}
          />

          {/* Color Palette Selector */}
          <Text style={styles.inputLabel}>Ritual Accent Color</Text>
          <View style={styles.colorPaletteRow}>
            {RITUAL_COLORS.map((c) => {
              const isSelected = habitColor === c.hex;
              return (
                <Pressable
                  key={c.hex}
                  onPress={() => {
                    haptic.selection();
                    setHabitColor(c.hex);
                  }}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c.hex },
                    isSelected && styles.colorSwatchSelected,
                  ]}
                >
                  {isSelected && <CheckIcon size={14} color="#FFFFFF" strokeWidth={3} />}
                </Pressable>
              );
            })}
          </View>

          {/* Icon Selector */}
          <Text style={styles.inputLabel}>Ritual Icon</Text>
          <View style={styles.iconSelectorGrid}>
            {RITUAL_ICONS.map((ic) => {
              const isSelected = habitIcon === ic.key;
              return (
                <Pressable
                  key={ic.key}
                  onPress={() => {
                    haptic.selection();
                    setHabitIcon(ic.key);
                  }}
                  style={[
                    styles.iconGridItem,
                    isSelected && {
                      backgroundColor: habitColor + '18',
                      borderColor: habitColor,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={ic.icon as any}
                    size={18}
                    color={isSelected ? habitColor : '#88827E'}
                  />
                  <Text
                    style={[
                      styles.iconGridLabel,
                      isSelected && { color: habitColor, fontWeight: '700' },
                    ]}
                    numberOfLines={1}
                  >
                    {ic.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={styles.sheetActionsRow}>
            {editingHabitId && (
              <Pressable
                onPress={() => handleDeleteHabit(editingHabitId)}
                style={styles.deleteHabitBtn}
              >
                <TrashIcon size={16} color="#D4736C" />
                <Text style={styles.deleteHabitBtnText}>Delete</Text>
              </Pressable>
            )}

            <View style={{ flex: 1 }}>
              <Button
                title={editingHabitId ? 'Save Changes' : 'Create Ritual'}
                onPress={handleSaveHabit}
                fullWidth
                size="medium"
              />
            </View>
          </View>
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#34312F',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    color: '#88827E',
    marginTop: 1,
  },
  aiPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#34312F',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
  },
  aiPlanButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34312F',
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  aiBriefCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEAE5',
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  aiBriefTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  aiBriefBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiBriefBadge: {
    backgroundColor: '#FAF0EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0E2DA',
  },
  aiBriefBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C58882',
    letterSpacing: 0.2,
  },
  aiBriefCounter: {
    fontSize: 12,
    fontWeight: '600',
    color: '#88827E',
  },
  aiBriefHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34312F',
    lineHeight: 20,
    marginBottom: 4,
  },
  aiBriefBody: {
    fontSize: 12.5,
    color: '#88827E',
    lineHeight: 18,
    marginBottom: 12,
  },
  aiActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  aiActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF8F4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  aiActionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34312F',
  },
  aiCaptureWrapper: {
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  aiCaptureCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 24,
    height: 48,
    paddingLeft: 14,
    paddingRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(238, 234, 229, 0.85)',
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  aiCaptureInput: {
    flex: 1,
    height: 46,
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#34312F',
  },
  aiCaptureSendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#C58882',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiOptimizedNotice: {
    fontSize: 11.5,
    color: '#C58882',
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#34312F',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#88827E',
    fontWeight: '500',
  },
  habitsScroll: {
    gap: 10,
    paddingHorizontal: 20,
  },
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEEAE5',
    padding: 12,
    width: 135,
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  completedHabitCard: {
    borderColor: '#8DB580',
    backgroundColor: '#F7FAF6',
  },
  habitTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  habitCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C58882',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  habitCheckCircleActive: {
    backgroundColor: '#8DB580',
    borderColor: '#8DB580',
  },
  streakBadge: {
    backgroundColor: '#FAF0EB',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  streakBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#C58882',
  },
  habitName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34312F',
    marginBottom: 2,
  },
  completedHabitName: {
    color: '#8DB580',
    textDecorationLine: 'line-through',
  },
  habitSub: {
    fontSize: 11,
    color: '#88827E',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  statusFilters: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEAE5',
    padding: 3,
    marginBottom: 10,
  },
  statusTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 13,
  },
  activeStatusTab: {
    backgroundColor: '#34312F',
  },
  statusTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#88827E',
  },
  activeStatusTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  priorityFilterScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  activePriorityChip: {
    borderColor: '#34312F',
    backgroundColor: '#F5ECE7',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityChipText: {
    fontSize: 11.5,
    color: '#88827E',
    fontWeight: '600',
  },
  activePriorityChipText: {
    color: '#34312F',
    fontWeight: '700',
  },
  taskListSection: {
    paddingHorizontal: 20,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEEAE5',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  taskCardCompleted: {
    opacity: 0.7,
    backgroundColor: '#FAF8F4',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#C58882',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  checkboxCompleted: {
    backgroundColor: '#8DB580',
    borderColor: '#8DB580',
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#34312F',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#A8A29E',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueBadgeText: {
    fontSize: 11.5,
    color: '#88827E',
  },
  aiBreakdownLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF0EB',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aiBreakdownText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#C58882',
  },
  taskPriorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 6,
  },
  taskPriorityText: {
    fontSize: 11,
    fontWeight: '800',
  },
  deleteButton: {
    padding: 6,
    marginLeft: 4,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEAE5',
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FBF5F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EFE5DF',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34312F',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#88827E',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  sheetContent: {
    paddingBottom: 36,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#88827E',
    marginBottom: 8,
  },
  prioritySelectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EEEAE5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34312F',
  },
  customizeRitualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF0EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0E2DA',
  },
  customizeRitualBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C58882',
  },
  habitBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  habitIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  habitDotsBtn: {
    padding: 2,
  },
  newRitualCard: {
    width: 125,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EFE4DD',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newRitualIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF0EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EFE4DD',
  },
  newRitualCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34312F',
  },
  newRitualCardSub: {
    fontSize: 10.5,
    color: '#88827E',
    marginTop: 1,
  },
  presetSection: {
    marginBottom: 12,
  },
  presetSectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#88827E',
    marginBottom: 8,
  },
  presetScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEAE5',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 16,
  },
  presetChipText: {
    fontSize: 12,
    color: '#34312F',
    fontWeight: '500',
  },
  colorPaletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    marginTop: 6,
  },
  colorSwatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#34312F',
  },
  iconSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    marginTop: 6,
  },
  iconGridItem: {
    width: '31%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEAE5',
    backgroundColor: '#FFFFFF',
  },
  iconGridLabel: {
    fontSize: 11.5,
    color: '#5A5450',
    flex: 1,
  },
  sheetActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    marginBottom: 10,
  },
  deleteHabitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FAF0EB',
    borderWidth: 1,
    borderColor: '#F0E2DA',
  },
  deleteHabitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4736C',
  },
});
