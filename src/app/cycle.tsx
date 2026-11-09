import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  TextInput,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
} from 'date-fns';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';
import Svg, {
  Path,
  Circle,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { haptic } from '../utils/haptics';
import { Card, BottomSheet } from '../components/common';
import {
  ChevronLeftIcon,
  PlayIcon,
  PauseIcon,
} from '../components/icons';
import { audioService } from '../utils/audio';
import {
  cycleRepository,
  CycleStatus,
  CycleLog,
  FlowLevel,
  CycleSettings,
} from '../database/repositories';
import { useAppStore } from '../stores/appStore';

const { width } = Dimensions.get('window');

type ScreenTab = 'today' | 'care' | 'analytics';

const SYMPTOM_OPTIONS = [
  'Cramps',
  'Bloating',
  'Fatigue',
  'Headache',
  'Back Pain',
  'Mood Swings',
  'Tender',
  'Clear Skin',
  'Sugar Cravings',
  'High Energy',
];

const EMOTICON_THUMBS = [
  require('../../assets/emoticons/joyful_peach.png'),
  require('../../assets/emoticons/sweet_smile.png'),
  require('../../assets/emoticons/peaceful_sad.png'),
  require('../../assets/emoticons/yawning_tired.png'),
  require('../../assets/emoticons/cute_kitty.png'),
];

// Helper functions for SVG Arc math
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

export default function CycleTrackerScreen() {
  const router = useRouter();
  const userProfile = useAppStore((s) => s.userProfile);
  const displayName = userProfile?.displayName || 'Olivia';

  // Navigation Sub-tab ('today' | 'care' | 'analytics')
  const [activeTab, setActiveTab] = useState<ScreenTab>('today');

  // Cycle Data
  const [status, setStatus] = useState<CycleStatus>(cycleRepository.getStatus());
  const [settings, setSettings] = useState<CycleSettings>(cycleRepository.getSettings());

  // Selected Day in Week Strip (defaults to today)
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  // Daily Log for Selected Day
  const [log, setLog] = useState<CycleLog | null>(null);
  const [waterGlasses, setWaterGlasses] = useState(5);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [symptoms, setSymptoms] = useState<string[]>(['Cramps', 'Bloating', 'Fatigue', 'Headache']);
  const [mood, setMood] = useState('Happy');
  const [isPeriodDay, setIsPeriodDay] = useState(false);
  const [flowLevel, setFlowLevel] = useState<FlowLevel>('none');

  // Care Screen States
  const [magnesiumReminder, setMagnesiumReminder] = useState(true);
  const [isPlayingLutealCalm, setIsPlayingLutealCalm] = useState(false);
  const audioPlayerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleToggleLutealCalm = async () => {
    haptic.impact();
    if (isPlayingLutealCalm) {
      if (audioPlayerRef.current) {
        await audioPlayerRef.current.stop().catch(() => {});
        audioPlayerRef.current = null;
      }
      setIsPlayingLutealCalm(false);
    } else {
      setIsPlayingLutealCalm(true);
      const player = await audioService.playAudio('calm_chime', () => {
        setIsPlayingLutealCalm(false);
        audioPlayerRef.current = null;
      });
      if (player) {
        audioPlayerRef.current = player;
      }
    }
  };

  // Settings BottomSheet State
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [editCycleLength, setEditCycleLength] = useState('28');
  const [editPeriodLength, setEditPeriodLength] = useState('5');
  const [editLastPeriodDate, setEditLastPeriodDate] = useState('');

  // 7-day strip calculation centered around selectedDate
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const loadData = useCallback(() => {
    const s = cycleRepository.getStatus();
    const cfg = cycleRepository.getSettings();
    const currentLog = cycleRepository.getLogForDate(selectedDateStr);

    setStatus(s);
    setSettings(cfg);
    setLog(currentLog);

    if (currentLog) {
      setWaterGlasses(currentLog.waterGlasses);
      setSleepHours(currentLog.sleepHours);
      setSymptoms(currentLog.symptoms);
      setMood(currentLog.mood || 'Happy');
      setIsPeriodDay(currentLog.isPeriodDay);
      setFlowLevel(currentLog.flowLevel);
    } else {
      setIsPeriodDay(s.isPeriodToday);
      setFlowLevel(s.isPeriodToday ? 'medium' : 'none');
    }

    setEditCycleLength(cfg.cycleLength.toString());
    setEditPeriodLength(cfg.periodLength.toString());
    setEditLastPeriodDate(cfg.lastPeriodStart || format(new Date(), 'yyyy-MM-dd'));
  }, [selectedDateStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectDay = (day: Date) => {
    haptic.selection();
    setSelectedDate(day);
  };

  const handleAdjustWater = (delta: number) => {
    haptic.impact();
    const nextVal = Math.max(0, Math.min(16, waterGlasses + delta));
    setWaterGlasses(nextVal);
    cycleRepository.saveLog(selectedDateStr, {
      isPeriodDay,
      flowLevel,
      symptoms,
      mood,
      waterGlasses: nextVal,
      sleepHours,
    });
  };

  const handleAdjustSleep = () => {
    haptic.selection();
    const options = [6, 6.5, 7, 7.5, 8, 8.5, 9];
    const nextIdx = (options.indexOf(sleepHours) + 1) % options.length;
    const nextSleep = options[nextIdx];
    setSleepHours(nextSleep);
    cycleRepository.saveLog(selectedDateStr, {
      isPeriodDay,
      flowLevel,
      symptoms,
      mood,
      waterGlasses,
      sleepHours: nextSleep,
    });
  };

  const handleCycleMood = () => {
    haptic.selection();
    const moods = ['Happy', 'Peaceful', 'Sensitive', 'Tired', 'Reflective'];
    const nextIdx = (moods.indexOf(mood) + 1) % moods.length;
    const nextMood = moods[nextIdx];
    setMood(nextMood);
    cycleRepository.saveLog(selectedDateStr, {
      isPeriodDay,
      flowLevel,
      symptoms,
      mood: nextMood,
      waterGlasses,
      sleepHours,
    });
  };

  const handleToggleSymptom = (sym: string) => {
    haptic.selection();
    const next = symptoms.includes(sym)
      ? symptoms.filter((s) => s !== sym)
      : [...symptoms, sym];
    setSymptoms(next);
    cycleRepository.saveLog(selectedDateStr, {
      isPeriodDay,
      flowLevel,
      symptoms: next,
      mood,
      waterGlasses,
      sleepHours,
    });
  };

  const handleSaveSettings = () => {
    haptic.impact();
    const cLen = parseInt(editCycleLength, 10) || 28;
    const pLen = parseInt(editPeriodLength, 10) || 5;

    cycleRepository.updateSettings({
      cycleLength: Math.min(45, Math.max(20, cLen)),
      periodLength: Math.min(10, Math.max(2, pLen)),
      lastPeriodStart: editLastPeriodDate.trim() || format(new Date(), 'yyyy-MM-dd'),
    });

    setShowSettingsSheet(false);
    loadData();
  };

  // Mathematical positioning for the Hero Arch Vector (Custom Gauge via SVG)
  const totalDays = Math.max(20, settings.cycleLength);
  const cycleProgress = Math.min(1, Math.max(0.01, status.cycleDay / totalDays));
  // Arch angles: from 270 (left) to 90 (right), over the top (0 deg)
  const arcSweepAngle = cycleProgress * 180;
  const currentEndAngle = 270 + arcSweepAngle;
  const knobPos = polarToCartesian(150, 140, 105, currentEndAngle);
  const backgroundTrackPath = describeArc(150, 140, 105, 270, 450); // 270 to 90
  const progressTrackPath = describeArc(150, 140, 105, 270, currentEndAngle);

  // Mood Trends Semicircular Gauge via SVG (82%)
  const moodProgress = 0.82;
  const moodEndAngle = 270 + moodProgress * 180;
  const moodTrackBg = describeArc(80, 75, 52, 270, 450);
  const moodProgressPath = describeArc(80, 75, 52, 270, moodEndAngle);

  // react-native-gifted-charts Stacked Bar Chart Data
  // Blue cycle length with yellow period duration sections
  const giftedBarData = useMemo(() => [
    {
      stacks: [
        { value: 5, color: '#F7D154', marginBottom: 0 }, // yellow period section
        { value: 23, color: '#7AA7C2', borderTopLeftRadius: 7, borderTopRightRadius: 7 }, // blue cycle section
      ],
      label: 'Jan',
    },
    {
      stacks: [
        { value: 5, color: '#F7D154', marginBottom: 0 },
        { value: 22, color: '#7AA7C2', borderTopLeftRadius: 7, borderTopRightRadius: 7 },
      ],
      label: 'Feb',
    },
    {
      stacks: [
        { value: 9, color: '#F7D154', marginBottom: 0 },
        { value: 16, color: '#7AA7C2', borderTopLeftRadius: 7, borderTopRightRadius: 7 },
      ],
      label: 'Mar',
    },
    {
      stacks: [
        { value: 5, color: '#F7D154', marginBottom: 0 },
        { value: 23, color: '#7AA7C2', borderTopLeftRadius: 7, borderTopRightRadius: 7 },
      ],
      label: 'Apr',
    },
    {
      stacks: [
        { value: 5, color: '#F7D154', marginBottom: 0 },
        { value: 23, color: '#7AA7C2', borderTopLeftRadius: 7, borderTopRightRadius: 7 },
      ],
      label: 'May',
    },
    {
      stacks: [
        { value: 5, color: '#F7D154', marginBottom: 0 },
        { value: 24, color: '#7AA7C2', borderTopLeftRadius: 7, borderTopRightRadius: 7 },
      ],
      label: 'Jun',
    },
  ], []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Floating Pill Switcher */}
      <View style={styles.topControlBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.navBackBtn}
        >
          <ChevronLeftIcon size={24} color="#34312F" />
        </Pressable>

        {/* 3-Tab Segment Switcher matching reference 3 screens */}
        <View style={styles.tabSwitcher}>
          <Pressable
            onPress={() => {
              haptic.selection();
              setActiveTab('today');
            }}
            style={[
              styles.tabPill,
              activeTab === 'today' && styles.tabPillActive,
            ]}
          >
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'today' && styles.tabPillTextActive,
              ]}
            >
              Today
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              haptic.selection();
              setActiveTab('care');
            }}
            style={[
              styles.tabPill,
              activeTab === 'care' && styles.tabPillActive,
            ]}
          >
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'care' && styles.tabPillTextActive,
              ]}
            >
              Phase Care
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              haptic.selection();
              setActiveTab('analytics');
            }}
            style={[
              styles.tabPill,
              activeTab === 'analytics' && styles.tabPillActive,
            ]}
          >
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'analytics' && styles.tabPillTextActive,
              ]}
            >
              Analytics
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => setShowSettingsSheet(true)}
          hitSlop={12}
          style={styles.navSettingsBtn}
        >
          <MaterialCommunityIcons name="dots-horizontal" size={22} color="#34312F" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================== */}
        {/* SCREEN 1: TODAY (Main Cycle Dashboard - Middle Reference) */}
        {/* ======================================================== */}
        {activeTab === 'today' && (
          <View>
            {/* Header Greeting matching reference */}
            <View style={styles.greetingHeader}>
              <View>
                <Text style={styles.greetingTitle}>
                  Good Morning, {displayName}
                </Text>
                <Text style={styles.greetingSub}>
                  Listen to your body today!
                </Text>
              </View>
              <Pressable
                onPress={() => setShowSettingsSheet(true)}
                style={styles.bellBtn}
              >
                <Ionicons name="notifications-outline" size={20} color="#34312F" />
              </Pressable>
            </View>

            {/* Horizontal 7-Day Calendar Strip */}
            <View style={styles.weekStrip}>
              {weekDays.map((day, idx) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentToday = isSameDay(day, new Date());
                const dayLetter = format(day, 'EEEEE'); // S, M, T, W, T, F, S
                const dayNumber = format(day, 'd');

                return (
                  <Pressable
                    key={idx}
                    onPress={() => handleSelectDay(day)}
                    style={[
                      styles.weekDayCapsule,
                      isSelected && styles.weekDayCapsuleActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.weekDayLetter,
                        isSelected && styles.weekDayLetterActive,
                      ]}
                    >
                      {dayLetter}
                    </Text>
                    <Text
                      style={[
                        styles.weekDayNum,
                        isSelected && styles.weekDayNumActive,
                        isCurrentToday && !isSelected && styles.weekDayNumCurrent,
                      ]}
                    >
                      {dayNumber}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* "Your Cycle Today" Hero Card with Custom SVG Arc Gauge */}
            <Card style={styles.cycleTodayCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderLabel}>Your Cycle Today</Text>
                <Pressable
                  onPress={() => setShowSettingsSheet(true)}
                  hitSlop={12}
                >
                  <MaterialCommunityIcons
                    name="dots-horizontal"
                    size={20}
                    color="#88827E"
                  />
                </Pressable>
              </View>

              {/* Vector SVG Curved Arc with Organic Cloud Backdrop */}
              <View style={styles.archVectorContainer}>
                <Svg width="100%" height={175} viewBox="0 0 300 175">
                  <Defs>
                    {/* Soft glowing cloud gradient */}
                    <RadialGradient id="cloudHalo" cx="50%" cy="65%" r="55%">
                      <Stop offset="0%" stopColor={status.phaseColor} stopOpacity="0.22" />
                      <Stop offset="65%" stopColor={status.phaseColor} stopOpacity="0.08" />
                      <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </RadialGradient>
                  </Defs>

                  {/* Soft cloud backdrop halo shape */}
                  <Path
                    d="M 50 145 C 40 100 70 45 110 38 C 130 22 170 22 190 38 C 230 45 260 100 250 145 Z"
                    fill="url(#cloudHalo)"
                  />

                  {/* Inner Dome Backdrop */}
                  <Path
                    d="M 55 140 A 95 95 0 0 1 245 140 Z"
                    fill="#FFFFFF"
                    opacity={0.92}
                  />

                  {/* Background Track Arc */}
                  <Path
                    d={backgroundTrackPath}
                    stroke="#F2EAE5"
                    strokeWidth={8}
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Active Progress Arc */}
                  <Path
                    d={progressTrackPath}
                    stroke={status.phaseColor}
                    strokeWidth={8}
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Slider Knob Indicator Bead */}
                  <Circle
                    cx={knobPos.x}
                    cy={knobPos.y}
                    r={9}
                    fill="#FFFFFF"
                    stroke={status.phaseColor}
                    strokeWidth={3.5}
                  />

                  {/* Centered Typography with Perfect Spacing */}
                  <SvgText
                    x={150}
                    y={100}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight="600"
                    fill="#88827E"
                  >
                    Day {status.cycleDay}
                  </SvgText>

                  <SvgText
                    x={150}
                    y={128}
                    textAnchor="middle"
                    fontSize={24}
                    fontWeight="800"
                    fill={status.phaseColor}
                    letterSpacing={-0.3}
                  >
                    {status.phaseLabel}
                  </SvgText>
                </Svg>
              </View>

              {/* Callout action banner */}
              <Pressable
                onPress={() => {
                  haptic.selection();
                  setActiveTab('care');
                }}
                style={styles.phaseCalloutBar}
              >
                <View style={styles.calloutTextGroup}>
                  <View style={styles.calloutTitleRow}>
                    <Text style={styles.calloutTitleText}>
                      Time to Slow Down & Nurture
                    </Text>
                    <Feather name="arrow-up-right" size={16} color="#C58882" />
                  </View>
                  <Text style={styles.calloutSubtitle}>
                    {status.phaseTip}
                  </Text>
                </View>
              </Pressable>
            </Card>

            {/* "Today's Wellness" Card with Balanced 2x2 Grid */}
            <Card style={styles.wellnessCard}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardHeaderLabel}>Today's Wellness</Text>
                  <Text style={styles.wellnessCheckinSub}>
                    Check-in completed for today
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    haptic.selection();
                    setActiveTab('care');
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.seeMoreLink}>See More</Text>
                </Pressable>
              </View>

              {/* Strict 2x2 Equal Grid */}
              <View style={styles.metricsGrid}>
                {/* Row 1: Mood & Sleep */}
                <View style={styles.metricRow}>
                  {/* 1. Mood */}
                  <Pressable
                    onPress={handleCycleMood}
                    style={styles.metricGridItem}
                  >
                    <Image
                      source={EMOTICON_THUMBS[0]}
                      style={styles.wellnessMoodIcon}
                      resizeMode="contain"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.metricLabel}>Your Mood</Text>
                      <Text style={styles.metricVal}>{mood}</Text>
                    </View>
                  </Pressable>

                  {/* 2. Sleep */}
                  <Pressable
                    onPress={handleAdjustSleep}
                    style={styles.metricGridItem}
                  >
                    <View style={styles.metricIconCircle}>
                      <Ionicons name="bed-outline" size={17} color="#4A7C59" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.metricLabel}>Sleep</Text>
                      <Text style={styles.metricVal}>{sleepHours}h 30min</Text>
                    </View>
                  </Pressable>
                </View>

                {/* Row 2: Water & Symptoms */}
                <View style={styles.metricRow}>
                  {/* 3. Water */}
                  <View style={styles.metricGridItem}>
                    <View style={styles.metricIconCircle}>
                      <Ionicons name="water-outline" size={17} color="#8BB0C4" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.metricLabel}>Water</Text>
                      <View style={styles.waterControls}>
                        <Text style={styles.metricVal}>
                          {waterGlasses}/8 glass
                        </Text>
                        <View style={styles.waterBtnsRow}>
                          <Pressable
                            onPress={() => handleAdjustWater(-1)}
                            hitSlop={6}
                            style={styles.waterMiniBtn}
                          >
                            <Text style={styles.waterMiniBtnText}>-</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleAdjustWater(1)}
                            hitSlop={6}
                            style={styles.waterMiniBtn}
                          >
                            <Text style={styles.waterMiniBtnText}>+</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* 4. Symptoms Preview */}
                  <View style={styles.metricGridItem}>
                    <View style={styles.metricIconCircle}>
                      <MaterialCommunityIcons
                        name="heart-pulse"
                        size={17}
                        color="#C58882"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.metricLabel}>Your Symptoms</Text>
                      <Text style={styles.symptomsListText} numberOfLines={1}>
                        {symptoms.length > 0
                          ? symptoms.slice(0, 2).join(', ')
                          : 'None'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Symptoms Pills Row */}
              <View style={styles.symptomsRow}>
                <Text style={styles.symptomToggleLabel}>Tap to toggle symptoms:</Text>
                <View style={styles.symptomPillsWrap}>
                  {SYMPTOM_OPTIONS.map((sym) => {
                    const isSelected = symptoms.includes(sym);
                    return (
                      <Pressable
                        key={sym}
                        onPress={() => handleToggleSymptom(sym)}
                        style={[
                          styles.symptomPill,
                          isSelected && styles.symptomPillActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.symptomPillText,
                            isSelected && styles.symptomPillTextActive,
                          ]}
                        >
                          {sym}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* ======================================================== */}
        {/* SCREEN 2: DAILY PHASE CARE (Left Screen in Reference)     */}
        {/* ======================================================== */}
        {activeTab === 'care' && (
          <View>
            {/* Title Header */}
            <View style={styles.careHeader}>
              <Text style={styles.careHeaderTitle}>Daily Phase Care</Text>
              <Text style={styles.careHeaderSub}>
                {status.phaseLabel} - Day {status.cycleDay}
              </Text>
            </View>

            {/* Movement & Nutrition Cards side by side */}
            <View style={styles.careCardsRow}>
              {/* Movement Card */}
              <Card style={styles.halfCareCard}>
                <View style={[styles.careIconBox, { backgroundColor: '#F2E8E4' }]}>
                  <MaterialCommunityIcons
                    name="yoga"
                    size={22}
                    color="#C58882"
                  />
                </View>
                <Text style={styles.careCategoryLabel}>Movement</Text>
                <Text style={styles.careCardHeading}>
                  Gentle Pilates & Body Stretch
                </Text>
                <Pressable
                  onPress={() => {
                    haptic.impact();
                    Alert.alert(
                      'Gentle Pilates & Stretch',
                      '10-min restorative routine:\n1. Cat-Cow flow (2 min)\n2. Child pose with deep belly breathing (3 min)\n3. Gentle spinal twist (3 min)\n4. Savasana rest (2 min)',
                      [{ text: 'Start Flow' }]
                    );
                  }}
                  style={styles.careActionLink}
                >
                  <View style={styles.careActionLinkRow}>
                    <Ionicons name="play-circle" size={15} color="#C58882" />
                    <Text style={styles.careActionLinkText}>Start Session</Text>
                  </View>
                </Pressable>
              </Card>

              {/* Nutrition Card */}
              <Card style={styles.halfCareCard}>
                <View style={[styles.careIconBox, { backgroundColor: '#F8EFE4' }]}>
                  <MaterialCommunityIcons
                    name="food-apple-outline"
                    size={22}
                    color="#E8A56F"
                  />
                </View>
                <Text style={styles.careCategoryLabel}>Nutrition</Text>
                <Text style={styles.careCardHeading}>
                  Warm Roasted Sweet Potato Bowl
                </Text>
                <Pressable
                  onPress={() => {
                    haptic.impact();
                    Alert.alert(
                      'Phase Nutrition Insight',
                      'Rich in complex carbohydrates, vitamin B6, and potassium to support steady blood sugar and soothe tension during this cycle phase.',
                      [{ text: 'Got it' }]
                    );
                  }}
                  style={styles.careActionLink}
                >
                  <Text style={styles.careActionLinkText}>View Quick Recipes ↗</Text>
                </Pressable>
              </Card>
            </View>

            {/* Daily Reminder with Toggle Switch */}
            <Card style={styles.reminderCard}>
              <View style={styles.reminderLeft}>
                <View style={styles.reminderIconCircle}>
                  <MaterialCommunityIcons
                    name="pill"
                    size={20}
                    color="#C58882"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reminderTitle}>Magnesium Supplement</Text>
                  <Text style={styles.reminderSub}>
                    Helps reduce {status.phaseLabel} cramping
                  </Text>
                </View>
              </View>
              <View style={styles.reminderRight}>
                <Text style={styles.reminderTime}>09:00</Text>
                <Switch
                  value={magnesiumReminder}
                  onValueChange={(val) => {
                    haptic.selection();
                    setMagnesiumReminder(val);
                  }}
                  trackColor={{ false: '#EEEAE5', true: '#C58882' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </Card>

            {/* Mind & Body Audio Player Card matching reference */}
            <Card style={styles.audioCareCard}>
              <View style={styles.audioTopRow}>
                <View style={styles.audioThumbnail}>
                  <Ionicons name="musical-notes" size={20} color="#C58882" />
                </View>
                <View style={styles.audioInfo}>
                  <Text style={styles.audioTag}>Mind & Body</Text>
                  <Text style={styles.audioTitle}>
                    {status.phaseLabel} Calm
                  </Text>
                  <Text style={styles.audioSub}>
                    Soothing sounds for rest and balance
                  </Text>
                </View>
                <Pressable
                  onPress={handleToggleLutealCalm}
                  style={styles.audioPlayBtn}
                >
                  {isPlayingLutealCalm ? (
                    <PauseIcon size={16} color="#FFFFFF" />
                  ) : (
                    <PlayIcon size={16} color="#FFFFFF" />
                  )}
                </Pressable>
              </View>

              {/* Progress Slider Bar */}
              <View style={styles.audioProgressTrack}>
                <View
                  style={[
                    styles.audioProgressFill,
                    { width: isPlayingLutealCalm ? '65%' : '35%' },
                  ]}
                />
              </View>
              <View style={styles.audioTimeRow}>
                <Text style={styles.audioTimeText}>02:23</Text>
                <Text style={styles.audioTimeText}>07:00</Text>
              </View>
            </Card>

            {/* Pain & Bloating Relief Section */}
            <View style={styles.painReliefSection}>
              <Text style={styles.painSectionHeaderLabel}>Pain Relief</Text>
              <Text style={styles.painSectionTitle}>
                {status.phaseLabel} Bloating & Cramp Relief
              </Text>

              {/* Item 1 */}
              <Pressable
                onPress={() => {
                  haptic.selection();
                  Alert.alert(
                    'Gentle Abdominal Massage',
                    'Place warm hands on your lower abdomen and make gentle clockwise circles for 2 minutes to encourage relaxation.'
                  );
                }}
                style={styles.painReliefItem}
              >
                <View style={styles.painItemIconBox}>
                  <MaterialCommunityIcons
                    name="hand-back-right-outline"
                    size={20}
                    color="#C58882"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.painItemTitle}>Gentle AB Massage</Text>
                  <Text style={styles.painItemSub}>Relieve bloating in minutes</Text>
                </View>
                <Text style={styles.painItemDuration}>2 Mins</Text>
              </Pressable>

              {/* Item 2 */}
              <Pressable
                onPress={() => {
                  haptic.selection();
                  Alert.alert(
                    'Deep Belly Breathing',
                    'Inhale slowly for 4 seconds allowing your belly to rise, hold for 4, and release with a soft sigh.'
                  );
                }}
                style={styles.painReliefItem}
              >
                <View style={styles.painItemIconBox}>
                  <MaterialCommunityIcons
                    name="weather-windy"
                    size={20}
                    color="#8BB0C4"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.painItemTitle}>Deep Belly Breathing</Text>
                  <Text style={styles.painItemSub}>Calm cramps and tension</Text>
                </View>
                <Text style={styles.painItemDuration}>2 Mins</Text>
              </Pressable>

              {/* Item 3 */}
              <Pressable
                onPress={() => {
                  haptic.selection();
                  Alert.alert(
                    'Peppermint or Ginger Tea',
                    'A warm cup of herbal peppermint tea naturally relaxes the digestive muscles and relieves cramp discomfort.'
                  );
                }}
                style={styles.painReliefItem}
              >
                <View style={styles.painItemIconBox}>
                  <MaterialCommunityIcons
                    name="tea-outline"
                    size={20}
                    color="#7BA488"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.painItemTitle}>Peppermint Tea</Text>
                  <Text style={styles.painItemSub}>Soothe naturally</Text>
                </View>
                <Text style={styles.painItemDuration}>1 cup</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* SCREEN 3: ANALYTICS (Right Screen in Reference)           */}
        {/* ======================================================== */}
        {activeTab === 'analytics' && (
          <View>
            {/* Header */}
            <View style={styles.analyticsHeader}>
              <Text style={styles.analyticsTitle}>Analytics</Text>
              <Pressable
                onPress={() => {
                  haptic.selection();
                  Alert.alert('Report Exported', 'Cycle wellness report generated on device.');
                }}
                style={styles.downloadReportBtn}
              >
                <Ionicons name="download-outline" size={18} color="#34312F" />
              </Pressable>
            </View>

            {/* Cycle Length Trends Card with GiftedCharts Stacked BarChart */}
            <Card style={styles.chartCard}>
              <View style={styles.chartHeaderRow}>
                <Text style={styles.chartTitle}>Cycle Length Trends</Text>
                <View style={styles.chartDropdownPill}>
                  <Text style={styles.chartDropdownText}>6 Month ⌵</Text>
                </View>
              </View>

              {/* Floating Tooltip matching reference image */}
              <View style={styles.chartTooltip}>
                <Text style={styles.tooltipMonth}>March</Text>
                <View style={styles.tooltipDetailsRow}>
                  <View style={[styles.tooltipDot, { backgroundColor: '#7AA7C2' }]} />
                  <Text style={styles.tooltipText}>Cycle: 25 Days</Text>
                </View>
                <View style={styles.tooltipDetailsRow}>
                  <View style={[styles.tooltipDot, { backgroundColor: '#F7D154' }]} />
                  <Text style={styles.tooltipText}>Period: 9 Days</Text>
                </View>
              </View>

              {/* GiftedCharts BarChart with Yellow Period Sections */}
              <View style={styles.giftedBarContainer}>
                <BarChart
                  stackData={giftedBarData}
                  barWidth={18}
                  spacing={22}
                  initialSpacing={14}
                  roundedTop
                  roundedBottom
                  barBorderRadius={7}
                  noOfSections={3}
                  maxValue={35}
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor="#F5ECE7"
                  xAxisLabelTextStyle={{ fontSize: 11, color: '#88827E', fontWeight: '600' }}
                  hideRules
                  hideYAxisText
                  backgroundColor="transparent"
                  height={130}
                />
              </View>

              {/* Legend Row */}
              <View style={styles.chartLegendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#7AA7C2' }]} />
                  <Text style={styles.legendText}>Cycle Length</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F7D154' }]} />
                  <Text style={styles.legendText}>Period Duration</Text>
                </View>
              </View>
            </Card>

            {/* Symptoms Pattern Matrix matching reference */}
            <Card style={styles.matrixCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.chartTitle}>Symptoms Pattern</Text>
                <Pressable
                  onPress={() => {
                    haptic.selection();
                    setActiveTab('today');
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.addMoreLink}>+ Add More</Text>
                </Pressable>
              </View>

              {/* Matrix Rows */}
              {[
                { name: 'Low Energy', pattern: [1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1] },
                { name: 'Sugar Cravings', pattern: [0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1] },
                { name: 'Mild Cramps', pattern: [1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0] },
                { name: 'Bloating', pattern: [0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0] },
              ].map((row) => (
                <View key={row.name} style={styles.matrixRow}>
                  <Text style={styles.matrixLabel} numberOfLines={1}>
                    {row.name}
                  </Text>
                  <View style={styles.matrixDotsRow}>
                    {row.pattern.map((active, idx) => {
                      const phaseColor =
                        idx < 4
                          ? '#C58882' // Menstrual
                          : idx < 8
                            ? '#7BA488' // Follicular
                            : idx < 11
                              ? '#E8A56F' // Ovulatory
                              : '#7AA7C2'; // Luteal

                      return (
                        <View
                          key={idx}
                          style={[
                            styles.matrixDot,
                            active
                              ? { backgroundColor: phaseColor }
                              : { backgroundColor: '#F0ECE6' },
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>
              ))}

              {/* Matrix Phases Legend without decorative unicode dots */}
              <View style={styles.matrixLegendRow}>
                <View style={styles.phaseBadgeItem}>
                  <View style={[styles.legendPillMarker, { backgroundColor: '#C58882' }]} />
                  <Text style={styles.phaseLegendText}>Menstrual</Text>
                </View>
                <View style={styles.phaseBadgeItem}>
                  <View style={[styles.legendPillMarker, { backgroundColor: '#7BA488' }]} />
                  <Text style={styles.phaseLegendText}>Follicular</Text>
                </View>
                <View style={styles.phaseBadgeItem}>
                  <View style={[styles.legendPillMarker, { backgroundColor: '#E8A56F' }]} />
                  <Text style={styles.phaseLegendText}>Ovulatory</Text>
                </View>
                <View style={styles.phaseBadgeItem}>
                  <View style={[styles.legendPillMarker, { backgroundColor: '#7AA7C2' }]} />
                  <Text style={styles.phaseLegendText}>Luteal</Text>
                </View>
              </View>
            </Card>

            {/* Bottom 2 Insight Cards */}
            <View style={styles.insightCardsRow}>
              {/* Mood Trends Card with Clean Vector Gauge via SVG */}
              <Card style={styles.halfInsightCard}>
                <Text style={styles.insightCardTitle}>Mood Trends</Text>
                <View style={styles.moodGaugeWrapper}>
                  <Svg width="100%" height={85} viewBox="0 0 160 85">
                    {/* Background Arc */}
                    <Path
                      d={moodTrackBg}
                      stroke="#FAF0EB"
                      strokeWidth={9}
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* Progress Arc */}
                    <Path
                      d={moodProgressPath}
                      stroke="#7AA7C2"
                      strokeWidth={9}
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* Centered Big Value */}
                    <SvgText
                      x={80}
                      y={65}
                      textAnchor="middle"
                      fontSize={22}
                      fontWeight="800"
                      fill="#34312F"
                    >
                      82%
                    </SvgText>
                  </Svg>
                  <Text style={styles.insightStatSub}>Positive Day</Text>
                </View>
                <Text style={styles.insightChangeText}>
                  12% vs last month
                </Text>
              </Card>

              {/* Pain Insight Card */}
              <Card style={styles.halfInsightCard}>
                <Text style={styles.insightCardTitle}>Pain Insight</Text>
                <View style={styles.insightStatWrap}>
                  <Text style={[styles.insightBigNum, { color: '#C58882' }]}>
                    -28%
                  </Text>
                  <Text style={styles.insightStatSub}>Cramp Severity</Text>
                </View>
                <Text style={styles.insightChangeMutedText}>
                  Compared to last month
                </Text>
              </Card>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Cycle Settings BottomSheet */}
      <BottomSheet
        visible={showSettingsSheet}
        onClose={() => setShowSettingsSheet(false)}
        title="Cycle Settings"
      >
        <View style={styles.settingsSheetContent}>
          <Text style={styles.settingsInputLabel}>Average Cycle Length (Days)</Text>
          <TextInput
            value={editCycleLength}
            onChangeText={setEditCycleLength}
            keyboardType="number-pad"
            placeholder="28"
            style={styles.settingsTextInput}
          />

          <Text style={styles.settingsInputLabel}>Average Period Length (Days)</Text>
          <TextInput
            value={editPeriodLength}
            onChangeText={setEditPeriodLength}
            keyboardType="number-pad"
            placeholder="5"
            style={styles.settingsTextInput}
          />

          <Text style={styles.settingsInputLabel}>Last Period Start Date (YYYY-MM-DD)</Text>
          <TextInput
            value={editLastPeriodDate}
            onChangeText={setEditLastPeriodDate}
            placeholder="2026-10-28"
            style={styles.settingsTextInput}
          />

          <Pressable
            onPress={handleSaveSettings}
            style={styles.saveSettingsButton}
          >
            <Text style={styles.saveSettingsButtonText}>Save Cycle Settings</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  topControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEAE5',
  },
  navBackBtn: {
    padding: 6,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F3ECE8',
    borderRadius: 20,
    padding: 3,
    gap: 3,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tabPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#88827E',
  },
  tabPillTextActive: {
    color: '#34312F',
    fontWeight: '700',
  },
  navSettingsBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#34312F',
    letterSpacing: -0.4,
  },
  greetingSub: {
    fontSize: 13,
    color: '#88827E',
    marginTop: 2,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  weekDayCapsule: {
    alignItems: 'center',
    justifyContent: 'center',
    width: (width - 40 - 24) / 7,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  weekDayCapsuleActive: {
    backgroundColor: '#FAF0EB',
    borderColor: '#C58882',
    shadowColor: '#C58882',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  weekDayLetter: {
    fontSize: 11,
    fontWeight: '600',
    color: '#88827E',
    marginBottom: 4,
  },
  weekDayLetterActive: {
    color: '#C58882',
    fontWeight: '700',
  },
  weekDayNum: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34312F',
  },
  weekDayNumActive: {
    color: '#C58882',
    fontWeight: '800',
  },
  weekDayNumCurrent: {
    color: '#34312F',
  },
  cycleTodayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardHeaderLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34312F',
  },
  archVectorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    height: 175,
  },
  phaseCalloutBar: {
    backgroundColor: '#FAF0EB',
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#EFE2DB',
  },
  calloutTextGroup: {
    gap: 3,
  },
  calloutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calloutTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34312F',
  },
  calloutSubtitle: {
    fontSize: 12,
    color: '#6E6965',
    lineHeight: 17,
  },
  wellnessCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  wellnessCheckinSub: {
    fontSize: 12,
    color: '#88827E',
    marginTop: 2,
  },
  seeMoreLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C58882',
  },
  metricsGrid: {
    gap: 12,
    marginTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5ECE7',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricGridItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAF8F4',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  wellnessMoodIcon: {
    width: 32,
    height: 32,
  },
  metricIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#88827E',
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34312F',
    marginTop: 1,
  },
  symptomsListText: {
    fontSize: 11,
    color: '#5A4036',
    marginTop: 1,
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 2,
  },
  waterBtnsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  waterMiniBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#C58882',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterMiniBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 13,
  },
  symptomsRow: {
    marginTop: 14,
  },
  symptomToggleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#88827E',
    marginBottom: 8,
  },
  symptomPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  symptomPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FAF8F4',
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  symptomPillActive: {
    backgroundColor: '#FAF0EB',
    borderColor: '#C58882',
  },
  symptomPillText: {
    fontSize: 11.5,
    color: '#6E6965',
    fontWeight: '500',
  },
  symptomPillTextActive: {
    color: '#C58882',
    fontWeight: '700',
  },
  // Screen 2: Phase Care styles
  careHeader: {
    marginBottom: 16,
  },
  careHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#34312F',
  },
  careHeaderSub: {
    fontSize: 13,
    color: '#88827E',
    marginTop: 2,
  },
  careCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  halfCareCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  careIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  careCategoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#88827E',
    textTransform: 'uppercase',
  },
  careCardHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34312F',
    marginVertical: 4,
    minHeight: 38,
  },
  careActionLink: {
    marginTop: 4,
  },
  careActionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  careActionLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C58882',
  },
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reminderIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34312F',
  },
  reminderSub: {
    fontSize: 11.5,
    color: '#88827E',
    marginTop: 2,
  },
  reminderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  reminderTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#88827E',
  },
  audioCareCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  audioTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audioThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FAF0EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE2DB',
  },
  audioInfo: {
    flex: 1,
  },
  audioTag: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#88827E',
    textTransform: 'uppercase',
  },
  audioTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34312F',
  },
  audioSub: {
    fontSize: 11.5,
    color: '#88827E',
    marginTop: 1,
  },
  audioPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C58882',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioProgressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F3ECE8',
    marginTop: 14,
    overflow: 'hidden',
  },
  audioProgressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C58882',
  },
  audioTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  audioTimeText: {
    fontSize: 10.5,
    color: '#88827E',
  },
  painReliefSection: {
    marginTop: 4,
    marginBottom: 20,
  },
  painSectionHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#88827E',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  painSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34312F',
    marginBottom: 12,
  },
  painReliefItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEEAE5',
    gap: 12,
  },
  painItemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FAF8F4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  painItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#34312F',
  },
  painItemSub: {
    fontSize: 11.5,
    color: '#88827E',
    marginTop: 1,
  },
  painItemDuration: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#C58882',
  },
  // Screen 3: Analytics styles
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analyticsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#34312F',
  },
  downloadReportBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34312F',
  },
  chartDropdownPill: {
    backgroundColor: '#FAF8F4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  chartDropdownText: {
    fontSize: 11.5,
    color: '#88827E',
    fontWeight: '600',
  },
  chartTooltip: {
    alignSelf: 'center',
    backgroundColor: '#FAF0EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFE2DB',
    alignItems: 'center',
    gap: 2,
  },
  tooltipMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34312F',
  },
  tooltipDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tooltipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tooltipText: {
    fontSize: 10,
    color: '#6E6965',
    fontWeight: '600',
  },
  giftedBarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    paddingBottom: 6,
  },
  chartLegendRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#88827E',
  },
  matrixCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  addMoreLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C58882',
  },
  matrixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF8F4',
  },
  matrixLabel: {
    fontSize: 12,
    color: '#34312F',
    fontWeight: '600',
    width: 95,
  },
  matrixDotsRow: {
    flexDirection: 'row',
    gap: 5,
    flex: 1,
    justifyContent: 'flex-end',
  },
  matrixDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  matrixLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5ECE7',
  },
  phaseBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendPillMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  phaseLegendText: {
    fontSize: 10.5,
    color: '#88827E',
    fontWeight: '500',
  },
  insightCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfInsightCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  insightCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#88827E',
  },
  moodGaugeWrapper: {
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 85,
  },
  insightStatWrap: {
    marginVertical: 12,
  },
  insightBigNum: {
    fontSize: 24,
    fontWeight: '800',
    color: '#34312F',
  },
  insightStatSub: {
    fontSize: 11,
    color: '#88827E',
    marginTop: 2,
    textAlign: 'center',
  },
  insightChangeText: {
    fontSize: 11,
    color: '#4A7C59',
    fontWeight: '600',
    marginTop: 4,
  },
  insightChangeMutedText: {
    fontSize: 10.5,
    color: '#88827E',
    fontWeight: '500',
    marginTop: 4,
  },
  settingsSheetContent: {
    paddingBottom: 24,
  },
  settingsInputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#88827E',
    marginBottom: 6,
    marginTop: 10,
  },
  settingsTextInput: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEAE5',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#34312F',
    backgroundColor: '#FAF8F4',
  },
  saveSettingsButton: {
    backgroundColor: '#C58882',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  saveSettingsButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
