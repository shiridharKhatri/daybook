import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAppStore } from '../../stores/appStore';
import { haptic } from '../../utils/haptics';
import {
  BotanicalHeader,
  MascotBadge,
  WatercolorReaction,
  JournalTileIcon,
  NotesTileIcon,
  HaircareTileIcon,
  SkincareTileIcon,
  ShoppingTileIcon,
  TasksTileIcon,
} from '../../components/illustrations';
import { Card, Button, Input, BottomSheet, QuickCaptureSheet } from '../../components/common';
import { CalendarIcon, PlusIcon, CheckIcon, ChevronRightIcon, NoteIcon, SettingsIcon } from '../../components/icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  moodRepository,
  tasksRepository,
  financeRepository,
  notesRepository,
  cycleRepository,
  CycleStatus,
  TaskItem,
  NoteItem,
} from '../../database/repositories';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');
const GRID_GAP = 12;
const CARD_WIDTH = (width - 40 - GRID_GAP) / 2;

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HomeScreen() {
  const router = useRouter();
  const userProfile = useAppStore((state) => state.userProfile);
  const displayName = userProfile?.displayName || 'Friend';

  // State
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [showMoodSheet, setShowMoodSheet] = useState(false);
  const [showCapture, setShowCapture] = useState(false);

  // Data from SQLite
  const [pendingTasks, setPendingTasks] = useState<TaskItem[]>([]);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [todaySpending, setTodaySpending] = useState(0);
  const [recentNotes, setRecentNotes] = useState<NoteItem[]>([]);
  const [cycleStatus, setCycleStatus] = useState<CycleStatus>(cycleRepository.getStatus());
  const [dismissedSuggestion, setDismissedSuggestion] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const todayFormatted = useMemo(() => {
    return format(new Date(), 'EEEE, MMMM d');
  }, []);

  const loadDashboardData = useCallback(() => {
    // 1. Mood
    const todayMood = moodRepository.getToday();
    if (todayMood) {
      setSelectedMood(todayMood.mood);
      setMoodNote(todayMood.note || '');
    }

    // 2. Tasks
    const allPending = tasksRepository.getAll({ status: 'pending' });
    const allCompleted = tasksRepository.getAll({ status: 'completed' });
    setPendingTasks(allPending);
    setCompletedTasksCount(allCompleted.length);

    // 3. Finance
    const summary = financeRepository.getSummary();
    setTodaySpending(summary.spendingToday);

    // 4. Recent Notes
    const notes = notesRepository.getAll();
    setRecentNotes(notes.slice(0, 2));

    // 5. Cycle Status
    setCycleStatus(cycleRepository.getStatus());
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
    setTimeout(() => setRefreshing(false), 300);
  }, [loadDashboardData]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const handleSelectMood = (moodKey: string) => {
    setSelectedMood(moodKey);
    moodRepository.setMood({ mood: moodKey, note: moodNote });
    setShowMoodSheet(true);
  };

  const handleSaveMoodNote = () => {
    if (selectedMood) {
      moodRepository.setMood({ mood: selectedMood, note: moodNote });
    }
    setShowMoodSheet(false);
  };

  const handleToggleTask = (task: TaskItem) => {
    tasksRepository.toggleComplete(task.id, true);
    loadDashboardData();
  };

  // Smart contextual suggestion
  const suggestion = useMemo(() => {
    if (pendingTasks.length > 0) {
      return {
        title: `You have ${pendingTasks.length} task${pendingTasks.length > 1 ? 's' : ''} to complete`,
        sub: `Next: "${pendingTasks[0].title}"`,
        action: () => router.push('/(tabs)/tasks'),
      };
    }
    if (!selectedMood) {
      return {
        title: 'Daily mood check-in',
        sub: 'Select an emotion above to log how your day is feeling.',
        action: () => setShowMoodSheet(true),
      };
    }
    if (recentNotes.length === 0) {
      return {
        title: 'Start your personal journal',
        sub: 'Capture your thoughts, routines, or wishlist items.',
        action: () => router.push('/note/new'),
      };
    }
    return {
      title: 'Everything is in order',
      sub: 'All your tasks and routines are up to date.',
      action: () => router.push('/(tabs)/library'),
    };
  }, [pendingTasks, selectedMood, recentNotes, router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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
        {/* Top Header Banner with breathing room and botanical accent */}
        <View style={styles.headerContainer}>
          <View style={styles.botanicalWrapper}>
            <BotanicalHeader height={75} />
          </View>
          <View style={styles.headerRow}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.dateLabel}>{todayFormatted}</Text>
              <Text style={styles.greetingTitle}>
                {greeting}, {displayName}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/settings')}
              hitSlop={8}
              accessibilityLabel="Settings and Account"
              style={({ pressed }) => [
                styles.mascotButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <MascotBadge size={40} />
              <View style={styles.settingsBadgeDot}>
                <SettingsIcon size={10} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Daily Mood Tracker Card */}
        <View style={styles.section}>
          <Card style={styles.moodCard}>
            <View style={styles.moodHeaderRow}>
              <Text style={styles.sectionHeading}>How are you feeling today?</Text>
              <CalendarIcon size={18} color="#88827E" />
            </View>

            {/* Weekdays selector */}
            <View style={styles.daysRow}>
              {DAYS.map((day, idx) => {
                const isToday = idx === new Date().getDay();
                const isSelected = idx === selectedDayIndex;
                return (
                  <Pressable
                    key={idx}
                    onPress={() => setSelectedDayIndex(idx)}
                    style={[
                      styles.dayCircle,
                      isToday && styles.todayCircle,
                      isSelected && !isToday && styles.selectedDayCircle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isToday && styles.todayText,
                        isSelected && !isToday && styles.selectedDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* 5 Watercolor Reactions Row */}
            <View style={styles.reactionsRow}>
              {(['very_happy', 'happy', 'neutral', 'angry', 'sad'] as const).map(
                (mood) => (
                  <WatercolorReaction
                    key={mood}
                    name={mood}
                    size={48}
                    isSelected={selectedMood === mood}
                    onPress={() => handleSelectMood(mood)}
                  />
                )
              )}
            </View>
          </Card>
        </View>

        {/* Cycle & Rhythm Quick Banner */}
        <View style={styles.section}>
          <Pressable
            onPress={() => {
              haptic.selection();
              router.push('/cycle');
            }}
            style={({ pressed }) => [
              styles.cycleBanner,
              pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
            ]}
          >
            <View style={styles.cycleBannerLeft}>
              <View
                style={[
                  styles.cycleIconBadge,
                  {
                    backgroundColor: cycleStatus.phaseColor + '18',
                    borderColor: cycleStatus.phaseColor + '35',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={cycleStatus.isPeriodToday ? 'water-outline' : 'flower-tulip-outline'}
                  size={19}
                  color={cycleStatus.phaseColor}
                />
              </View>
              <View style={styles.cycleBannerTextWrap}>
                <View style={styles.cycleTitleRow}>
                  <Text style={styles.cycleBannerTitle}>
                    {cycleStatus.phaseLabel}
                  </Text>
                  <View
                    style={[
                      styles.cycleDayBadge,
                      { backgroundColor: cycleStatus.phaseColor + '18' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cycleDayBadgeText,
                        { color: cycleStatus.phaseColor },
                      ]}
                    >
                      Day {cycleStatus.cycleDay}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cycleBannerSub}>
                  {cycleStatus.isPeriodToday
                    ? 'Period active, tap to log symptoms'
                    : `Next period in ${cycleStatus.daysUntilNextPeriod} days (${cycleStatus.predictedNextPeriod})`}
                </Text>
              </View>
            </View>
            <ChevronRightIcon size={16} color="#88827E" />
          </Pressable>
        </View>

        {/* Organize & Collect Grid (2 equal columns, 3 rows) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Organize & Collect</Text>
          <View style={styles.tilesGrid}>
            {/* 1. Journal */}
            <Card
              style={styles.tileCard}
              onPress={() => router.push('/note/new?collection=col-personal')}
            >
              <View style={[styles.tileIconCircle, { backgroundColor: '#F8EFEA' }]}>
                <JournalTileIcon size={30} />
              </View>
              <Text style={styles.tileTitle}>Journal</Text>
              <Text style={styles.tileSub}>Daily reflections</Text>
            </Card>

            {/* 2. Notes */}
            <Card
              style={styles.tileCard}
              onPress={() => router.push({ pathname: '/(tabs)/library', params: { collection: 'all' } })}
            >
              <View style={[styles.tileIconCircle, { backgroundColor: '#FAF3E7' }]}>
                <NotesTileIcon size={30} />
              </View>
              <Text style={styles.tileTitle}>Notes</Text>
              <Text style={styles.tileSub}>Knowledge library</Text>
            </Card>

            {/* 3. Hair Care */}
            <Card
              style={styles.tileCard}
              onPress={() => router.push({ pathname: '/(tabs)/library', params: { collection: 'col-haircare' } })}
            >
              <View style={[styles.tileIconCircle, { backgroundColor: '#EEF5EC' }]}>
                <HaircareTileIcon size={30} />
              </View>
              <Text style={styles.tileTitle}>Hair Care</Text>
              <Text style={styles.tileSub}>Oils, serums & routines</Text>
            </Card>

            {/* 4. Skincare */}
            <Card
              style={styles.tileCard}
              onPress={() => router.push({ pathname: '/(tabs)/library', params: { collection: 'col-skincare' } })}
            >
              <View style={[styles.tileIconCircle, { backgroundColor: '#EAF2F7' }]}>
                <SkincareTileIcon size={30} />
              </View>
              <Text style={styles.tileTitle}>Skincare</Text>
              <Text style={styles.tileSub}>Products & steps</Text>
            </Card>

            {/* 5. Shopping */}
            <Card
              style={styles.tileCard}
              onPress={() => router.push({ pathname: '/(tabs)/library', params: { collection: 'col-shopping' } })}
            >
              <View style={[styles.tileIconCircle, { backgroundColor: '#F7ECEB' }]}>
                <ShoppingTileIcon size={30} />
              </View>
              <Text style={styles.tileTitle}>Shopping</Text>
              <Text style={styles.tileSub}>Wishlist & prices</Text>
            </Card>

            {/* 6. Tasks */}
            <Card
              style={styles.tileCard}
              onPress={() => router.push('/(tabs)/tasks')}
            >
              <View style={[styles.tileIconCircle, { backgroundColor: '#FBF1E6' }]}>
                <TasksTileIcon size={30} />
              </View>
              <Text style={styles.tileTitle}>Tasks</Text>
              <Text style={styles.tileSub}>Priorities & habits</Text>
            </Card>
          </View>
        </View>

        {/* Daily Overview Card */}
        <View style={styles.section}>
          <Card style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>Daily Overview</Text>
              <Pressable
                onPress={() => setShowCapture(true)}
                style={styles.quickAddButton}
              >
                <PlusIcon size={14} color="#C58882" />
                <Text style={styles.quickAddText}>Quick Capture</Text>
              </Pressable>
            </View>

            {/* Summary metrics row */}
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{pendingTasks.length}</Text>
                <Text style={styles.metricLabel}>Tasks left</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{completedTasksCount}</Text>
                <Text style={styles.metricLabel}>Completed</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>NPR {todaySpending}</Text>
                <Text style={styles.metricLabel}>Spent today</Text>
              </View>
            </View>

            {/* Pending tasks preview */}
            {pendingTasks.length > 0 ? (
              <View style={styles.taskList}>
                {pendingTasks.slice(0, 3).map((t) => (
                  <Pressable
                    key={t.id}
                    onPress={() => handleToggleTask(t)}
                    style={styles.taskRow}
                  >
                    <View style={styles.taskCheckbox}>
                      {t.status === 'completed' && (
                        <CheckIcon size={14} color="#8DB580" />
                      )}
                    </View>
                    <Text style={styles.taskTitle} numberOfLines={1}>
                      {t.title}
                    </Text>
                    <Text style={styles.taskPriority}>Priority {t.priority}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.allDoneText}>All tasks completed for today</Text>
            )}

            {/* Recent notes preview */}
            {recentNotes.length > 0 && (
              <View style={styles.recentNotesBox}>
                <Text style={styles.recentNotesLabel}>Recent Note</Text>
                <Pressable
                  onPress={() => router.push(`/note/${recentNotes[0].id}`)}
                  style={styles.recentNoteItem}
                >
                  <NoteIcon size={16} color="#88827E" />
                  <Text style={styles.recentNoteTitle} numberOfLines={1}>
                    {recentNotes[0].title}
                  </Text>
                  <ChevronRightIcon size={16} color="#B5AFA8" />
                </Pressable>
              </View>
            )}
          </Card>
        </View>

        {/* Daily Suggestion Card */}
        {!dismissedSuggestion && (
          <View style={styles.section}>
            <View style={styles.suggestionHeaderRow}>
              <Text style={styles.sectionHeading}>Daily Suggestion</Text>
              <Pressable
                onPress={() => setDismissedSuggestion(true)}
                hitSlop={8}
              >
                <Text style={styles.dismissText}>Dismiss</Text>
              </Pressable>
            </View>

            <Card style={styles.suggestionCard} onPress={suggestion.action}>
              <View style={styles.suggestionRow}>
                <View style={styles.suggestionIconCircle}>
                  <NoteIcon size={18} color="#C58882" />
                </View>
                <View style={styles.suggestionTextContainer}>
                  <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                  <Text style={styles.suggestionSubtitle}>{suggestion.sub}</Text>
                </View>
                <ChevronRightIcon size={18} color="#C58882" />
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Mood Journal Reflection Bottom Sheet */}
      <BottomSheet
        visible={showMoodSheet}
        onClose={() => setShowMoodSheet(false)}
        title="Mood Reflection"
      >
        <View style={styles.moodSheetContent}>
          {selectedMood && (
            <View style={styles.selectedMoodPreview}>
              <WatercolorReaction name={selectedMood as any} size={64} />
              <Text style={styles.selectedMoodLabel}>
                {selectedMood.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          )}

          <Input
            label="Daily journal note (optional)"
            placeholder="Write a few thoughts about what made you feel this way..."
            value={moodNote}
            onChangeText={setMoodNote}
            multiline
          />

          <Button
            title="Save Reflection"
            onPress={handleSaveMoodNote}
            fullWidth
            size="medium"
          />
        </View>
      </BottomSheet>

      {/* Global Quick Capture System */}
      <QuickCaptureSheet
        visible={showCapture}
        onClose={() => setShowCapture(false)}
        onSuccess={loadDashboardData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  headerContainer: {
    position: 'relative',
    paddingTop: 12,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  botanicalWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 75,
    opacity: 0.7,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerTextGroup: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#88827E',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#34312F',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  mascotButton: {
    marginLeft: 12,
    position: 'relative',
  },
  settingsBadgeDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#C58882',
    borderWidth: 1.5,
    borderColor: '#FAF8F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 18,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#34312F',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  moodCard: {
    padding: 16,
    borderRadius: 22,
  },
  moodHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    borderWidth: 1.5,
    borderColor: '#34312F',
  },
  selectedDayCircle: {
    backgroundColor: '#F5ECE7',
  },
  dayText: {
    fontSize: 13,
    color: '#88827E',
    fontWeight: '500',
  },
  todayText: {
    color: '#34312F',
    fontWeight: '700',
  },
  selectedDayText: {
    color: '#C58882',
    fontWeight: '600',
  },
  reactionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    paddingHorizontal: 6,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: GRID_GAP,
  },
  tileCard: {
    width: CARD_WIDTH,
    padding: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  tileIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tileTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34312F',
  },
  tileSub: {
    fontSize: 12,
    color: '#88827E',
    marginTop: 2,
  },
  overviewCard: {
    padding: 18,
    borderRadius: 22,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34312F',
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5ECE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  quickAddText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C58882',
    marginLeft: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FAF8F4',
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#34312F',
  },
  metricLabel: {
    fontSize: 11,
    color: '#88827E',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#EEEAE5',
  },
  taskList: {
    gap: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  taskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#C58882',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    color: '#34312F',
    fontWeight: '500',
  },
  taskPriority: {
    fontSize: 11,
    fontWeight: '600',
    color: '#88827E',
  },
  allDoneText: {
    fontSize: 13,
    color: '#88827E',
    textAlign: 'center',
    marginVertical: 4,
  },
  recentNotesBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5ECE7',
  },
  recentNotesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#88827E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  recentNoteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  recentNoteTitle: {
    flex: 1,
    fontSize: 14,
    color: '#34312F',
    fontWeight: '600',
  },
  cycleBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EEEAE5',
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  cycleBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  cycleIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cycleBannerTextWrap: {
    flex: 1,
  },
  cycleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cycleBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34312F',
  },
  cycleDayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cycleDayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cycleBannerSub: {
    fontSize: 12,
    color: '#88827E',
    marginTop: 2,
  },
  suggestionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dismissText: {
    fontSize: 12,
    color: '#88827E',
  },
  suggestionCard: {
    padding: 14,
    borderRadius: 18,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5ECE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34312F',
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: '#88827E',
    marginTop: 2,
  },
  moodSheetContent: {
    paddingBottom: 28,
  },
  selectedMoodPreview: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedMoodLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34312F',
    marginTop: 8,
    letterSpacing: 1,
  },
});
