import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Badge, GlassView } from '../../components/common';
import {
  AssistantIcon,
  SearchIcon,
  TaskIcon,
  FinanceIcon,
  HeartIcon,
  NoteIcon,
  CheckIcon,
  RotateCcwIcon,
  SendArrowIcon,
  ChevronRightIcon,
  MicIcon,
  StopIcon,
} from '../../components/icons';
import { audioService } from '../../utils/audio';
import {
  notesRepository,
  productsRepository,
  tasksRepository,
  financeRepository,
  moodRepository,
  cycleRepository,
  TaskItem,
  ProductItem,
  NoteItem,
  MoodRecord,
} from '../../database/repositories';
import { useAppStore } from '../../stores/appStore';
import { haptic } from '../../utils/haptics';
import { Orb } from '../../components/ui/thinking-orbs';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sourceType?: 'note' | 'product' | 'task' | 'finance' | 'mood';
  sourceId?: string;
  timestamp: number;
  tasksPayload?: TaskItem[];
  financePayload?: {
    balance: number;
    totalIncome: number;
    totalExpenses: number;
    spendingToday: number;
  };
  productsPayload?: ProductItem[];
  notesPayload?: NoteItem[];
  moodPayload?: MoodRecord[];
  followUps?: string[];
}

export default function AssistantScreen() {
  const router = useRouter();
  const userProfile = useAppStore((s) => s.userProfile);
  const scrollViewRef = useRef<any>(null);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const voiceSessionRef = useRef<any>(null);
  const voiceTimerRef = useRef<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${userProfile?.displayName || 'there'}! I am your personal Daybook assistant. I can search your notes, find saved hair & skincare products, review your spending, or organize your tasks, all privately on your device.`,
      timestamp: Date.now(),
      followUps: [
        'What tasks do I have today?',
        'How much have I spent so far?',
        'What hair products have I saved?',
        'What was my mood recently?',
      ],
    },
  ]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      if (voiceSessionRef.current) voiceSessionRef.current.stop().catch(() => {});
    };
  }, []);

  const handleToggleVoice = async () => {
    if (isListening) {
      haptic.impact();
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }
      setIsListening(false);
      const session = voiceSessionRef.current;
      voiceSessionRef.current = null;
      if (session) {
        await session.stop();
      }

      const promptToAsk = query.trim() || 'What tasks and routines do I have today?';
      setQuery('');
      setVoiceSeconds(0);
      handleAsk(promptToAsk);
    } else {
      haptic.impact();
      const hasPerm = await audioService.requestPermissions();
      if (!hasPerm) return;

      const session = await audioService.startVoiceRecording();
      voiceSessionRef.current = session;
      setIsListening(true);
      setVoiceSeconds(0);
      voiceTimerRef.current = setInterval(() => {
        setVoiceSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleResetChat = () => {
    haptic.selection();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Conversation refreshed. What would you like to explore or organize next?`,
        timestamp: Date.now(),
        followUps: [
          'What tasks do I have today?',
          'How much have I spent so far?',
          'What hair products have I saved?',
          'What was my mood recently?',
        ],
      },
    ]);
  };

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    haptic.impact();
    const isCompleted = currentStatus === 'pending';
    tasksRepository.toggleComplete(taskId, isCompleted);

    // Update message state locally so UI updates immediately
    setMessages((prev) =>
      prev.map((msg) => {
        if (!msg.tasksPayload) return msg;
        return {
          ...msg,
          tasksPayload: msg.tasksPayload.map((t) =>
            t.id === taskId
              ? { ...t, status: isCompleted ? 'completed' : 'pending' }
              : t
          ),
        };
      })
    );
  };

  const handleAsk = (userQuestion: string) => {
    const q = userQuestion.trim();
    if (!q) return;

    if (q.toLowerCase() === 'open cycle tracker') {
      haptic.selection();
      router.push('/cycle');
      return;
    }

    haptic.selection();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    setTimeout(() => {
      const qLower = q.toLowerCase();
      let reply = '';
      let sourceType: ChatMessage['sourceType'] = undefined;
      let sourceId: string | undefined = undefined;
      let tasksPayload: TaskItem[] | undefined = undefined;
      let financePayload: ChatMessage['financePayload'] = undefined;
      let productsPayload: ProductItem[] | undefined = undefined;
      let notesPayload: NoteItem[] | undefined = undefined;
      let moodPayload: MoodRecord[] | undefined = undefined;
      let followUps: string[] = [];

      if (qLower.includes('task') || qLower.includes('todo') || qLower.includes('to do') || qLower.includes('activity')) {
        const tasks = tasksRepository.getAll({ status: 'pending' });
        sourceType = 'task';
        if (tasks.length === 0) {
          reply = "You don't have any pending tasks right now. Your schedule is completely clear!";
          followUps = ['Add a new task', 'How much have I spent?', 'Show my saved notes'];
        } else {
          reply = `You have ${tasks.length} pending task(s). Here is your current priority list:`;
          tasksPayload = tasks.slice(0, 5);
          sourceId = tasks[0].id;
          followUps = ['Show priority A tasks', 'Open Activity screen', 'How much have I spent?'];
        }
      } else if (
        qLower.includes('hair') ||
        qLower.includes('skin') ||
        qLower.includes('product') ||
        qLower.includes('oil') ||
        qLower.includes('serum')
      ) {
        const category = qLower.includes('hair')
          ? 'haircare'
          : qLower.includes('skin')
          ? 'skincare'
          : undefined;
        const products = productsRepository.getAll({ category });
        sourceType = 'product';
        if (products.length === 0) {
          reply = `I searched your library, but you haven't saved any ${category || ''} products yet. You can add your favorite oils, serums, or wishlist items anytime from the Library!`;
          followUps = ['What tasks do I have today?', 'Show my saved notes'];
        } else {
          reply = `Found ${products.length} ${category || ''} product(s) in your personal library:`;
          productsPayload = products.slice(0, 4);
          sourceId = products[0].id;
          followUps = ['Show hair care only', 'Show skincare only', 'What tasks do I have?'];
        }
      } else if (
        qLower.includes('spend') ||
        qLower.includes('expense') ||
        qLower.includes('money') ||
        qLower.includes('finance') ||
        qLower.includes('balance') ||
        qLower.includes('budget')
      ) {
        const summary = financeRepository.getSummary();
        sourceType = 'finance';
        reply = `Here is your current financial balance & spending summary:`;
        financePayload = summary;
        followUps = ['What are my tasks today?', 'Show my saved notes', 'How was my mood?'];
      } else if (qLower.includes('mood') || qLower.includes('feel') || qLower.includes('emotion')) {
        const recentMoods = moodRepository.getRecent(5);
        sourceType = 'mood';
        if (recentMoods.length === 0) {
          reply = "You haven't recorded a mood entry yet. You can tap any of the watercolor emoticons on the Home screen to log how you feel.";
          followUps = ['What tasks do I have today?', 'How much have I spent?'];
        } else {
          reply = `Here are your recent mood check-ins:`;
          moodPayload = recentMoods;
          followUps = ['Log today’s mood', 'Show my saved notes', 'What tasks do I have?'];
        }
      } else if (
        qLower.includes('period') ||
        qLower.includes('cycle') ||
        qLower.includes('luteal') ||
        qLower.includes('ovulat') ||
        qLower.includes('fertile') ||
        qLower.includes('cramp') ||
        qLower.includes('menstru')
      ) {
        const cycleStatus = cycleRepository.getStatus();
        sourceType = 'note';
        reply = `You are on Day ${cycleStatus.cycleDay} of your cycle (${cycleStatus.phaseLabel}).\n\n${
          cycleStatus.isPeriodToday
            ? 'Your period is currently active.'
            : `Your next period is predicted for ~${cycleStatus.predictedNextPeriod} (in ${cycleStatus.daysUntilNextPeriod} days).`
        }\n\nWellness Tip: ${cycleStatus.phaseTip}`;
        followUps = ['Open Cycle Tracker', 'What tasks do I have today?', 'How was my mood?'];
      } else {
        const notes = notesRepository.getAll({ search: q });
        sourceType = 'note';
        if (notes.length > 0) {
          reply = `Found ${notes.length} note(s) matching "${q}":`;
          notesPayload = notes.slice(0, 3);
          sourceId = notes[0].id;
          followUps = ['What tasks do I have today?', 'Show my spending balance'];
        } else {
          reply = `I searched your local Daybook notes and records for "${q}", but didn't find an exact match. Try asking about your tasks, products, expenses, or notes!`;
          followUps = [
            'What tasks do I have today?',
            'How much have I spent so far?',
            'What hair products have I saved?',
          ];
        }
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: reply,
        sourceType,
        sourceId,
        tasksPayload,
        financePayload,
        productsPayload,
        notesPayload,
        moodPayload,
        followUps,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 380);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <MaterialCommunityIcons name="robot-happy" size={20} color="#C58882" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Assistant</Text>
            <Text style={styles.headerSub}>Personal Knowledge & Search</Text>
          </View>
        </View>

        <Pressable
          onPress={handleResetChat}
          hitSlop={10}
          style={({ pressed }) => [
            styles.resetBtn,
            pressed && { opacity: 0.7, transform: [{ scale: 0.94 }] },
          ]}
        >
          <RotateCcwIcon size={16} color="#88827E" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.chatScroll,
            { paddingBottom: isKeyboardVisible ? 24 : (Platform.OS === 'ios' ? 140 : 130) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* Messages List */}
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <View
                key={m.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.userRow : styles.assistantRow,
                ]}
              >
                {!isUser && (
                  <View style={styles.botAvatarBadge}>
                    <MaterialCommunityIcons name="robot-happy" size={15} color="#C58882" />
                  </View>
                )}

                <View style={isUser ? styles.userBubbleContainer : styles.assistantContentContainer}>
                  <View
                    style={[
                      styles.bubble,
                      isUser ? styles.userBubble : styles.assistantBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isUser
                          ? styles.userMessageText
                          : styles.assistantMessageText,
                      ]}
                    >
                      {m.content}
                    </Text>

                    {/* Rich Task List Payload */}
                    {m.tasksPayload && m.tasksPayload.length > 0 && (
                      <View style={styles.richTasksWrapper}>
                        {m.tasksPayload.map((task) => {
                          const isDone = task.status === 'completed';
                          const pColor =
                            task.priority === 'A'
                              ? '#D4736C'
                              : task.priority === 'B'
                              ? '#E8B36F'
                              : '#8DB580';

                          return (
                            <Pressable
                              key={task.id}
                              onPress={() => handleToggleTask(task.id, task.status)}
                              style={styles.taskMiniCard}
                            >
                              <View
                                style={[
                                  styles.taskCheckCircle,
                                  isDone && styles.taskCheckCircleDone,
                                ]}
                              >
                                {isDone && <CheckIcon size={12} color="#FFFFFF" strokeWidth={3} />}
                              </View>
                              <View style={styles.taskMiniInfo}>
                                <Text
                                  style={[
                                    styles.taskMiniTitle,
                                    isDone && styles.taskMiniTitleDone,
                                  ]}
                                  numberOfLines={1}
                                >
                                  {task.title}
                                </Text>
                                {task.dueDate && (
                                  <Text style={styles.taskMiniDue}>Due: {task.dueDate}</Text>
                                )}
                              </View>
                              <View style={[styles.priorityPill, { backgroundColor: pColor + '18' }]}>
                                <Text style={[styles.priorityPillText, { color: pColor }]}>
                                  {task.priority}
                                </Text>
                              </View>
                            </Pressable>
                          );
                        })}

                        <Pressable
                          onPress={() => router.push('/tasks')}
                          style={styles.cardActionLink}
                        >
                          <Text style={styles.cardActionLinkText}>Open all tasks in Activity →</Text>
                        </Pressable>
                      </View>
                    )}

                    {/* Rich Finance Summary Payload */}
                    {m.financePayload && (
                      <View style={styles.richFinanceWrapper}>
                        <View style={styles.financeBalanceRow}>
                          <Text style={styles.financeBalanceLabel}>Current Balance</Text>
                          <Text style={styles.financeBalanceVal}>
                            NPR {m.financePayload.balance.toLocaleString()}
                          </Text>
                        </View>
                        <View style={styles.financeMetricsRow}>
                          <View style={styles.financeMetricPill}>
                            <Text style={styles.financeMetricTag}>Income</Text>
                            <Text style={[styles.financeMetricNum, { color: '#4A7C59' }]}>
                              +{m.financePayload.totalIncome.toLocaleString()}
                            </Text>
                          </View>
                          <View style={styles.financeMetricPill}>
                            <Text style={styles.financeMetricTag}>Expenses</Text>
                            <Text style={[styles.financeMetricNum, { color: '#C58882' }]}>
                              -{m.financePayload.totalExpenses.toLocaleString()}
                            </Text>
                          </View>
                          <View style={styles.financeMetricPill}>
                            <Text style={styles.financeMetricTag}>Today</Text>
                            <Text style={styles.financeMetricNum}>
                              {m.financePayload.spendingToday.toLocaleString()}
                            </Text>
                          </View>
                        </View>
                        <Pressable
                          onPress={() => router.push('/finance')}
                          style={styles.cardActionLink}
                        >
                          <Text style={styles.cardActionLinkText}>View full budget & spending →</Text>
                        </Pressable>
                      </View>
                    )}

                    {/* Rich Products Payload */}
                    {m.productsPayload && m.productsPayload.length > 0 && (
                      <View style={styles.richProductsWrapper}>
                        {m.productsPayload.map((prod) => (
                          <View key={prod.id} style={styles.productMiniCard}>
                            <View style={styles.productMiniLeft}>
                              <Text style={styles.productMiniName} numberOfLines={1}>
                                {prod.name}
                              </Text>
                              <Text style={styles.productMiniBrand}>
                                {prod.brand || prod.category}
                              </Text>
                            </View>
                            {prod.price ? (
                              <View style={styles.productPricePill}>
                                <Text style={styles.productPriceText}>
                                  NPR {prod.price.toLocaleString()}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        ))}
                        <Pressable
                          onPress={() => router.push('/library')}
                          style={styles.cardActionLink}
                        >
                          <Text style={styles.cardActionLinkText}>Explore full library →</Text>
                        </Pressable>
                      </View>
                    )}

                    {/* Rich Notes Payload */}
                    {m.notesPayload && m.notesPayload.length > 0 && (
                      <View style={styles.richNotesWrapper}>
                        {m.notesPayload.map((note) => (
                          <Pressable
                            key={note.id}
                            onPress={() => router.push(`/note/${note.id}`)}
                            style={styles.noteMiniCard}
                          >
                            <NoteIcon size={16} color="#C58882" />
                            <View style={styles.noteMiniInfo}>
                              <Text style={styles.noteMiniTitle} numberOfLines={1}>
                                {note.title}
                              </Text>
                              <Text style={styles.noteMiniExcerpt} numberOfLines={1}>
                                {note.content || 'Tap to open note'}
                              </Text>
                            </View>
                            <ChevronRightIcon size={16} color="#88827E" />
                          </Pressable>
                        ))}
                      </View>
                    )}

                    {/* Rich Mood Check-ins Payload */}
                    {m.moodPayload && m.moodPayload.length > 0 && (
                      <View style={styles.richMoodWrapper}>
                        {m.moodPayload.map((rec) => (
                          <View key={rec.id} style={styles.moodMiniCard}>
                            <View style={styles.moodMiniBadge}>
                              <HeartIcon size={14} color="#C58882" />
                            </View>
                            <View style={styles.moodMiniInfo}>
                              <Text style={styles.moodMiniTitle}>
                                {rec.mood.replace('_', ' ').toUpperCase()}
                              </Text>
                              {rec.note ? (
                                <Text style={styles.moodMiniNote} numberOfLines={1}>
                                  "{rec.note}"
                                </Text>
                              ) : null}
                            </View>
                            <Text style={styles.moodMiniDate}>{rec.date}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Contextual Follow-up Chips */}
                  {m.followUps && m.followUps.length > 0 && (
                    <View style={styles.followUpsRow}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.followUpsScroll}
                      >
                        {m.followUps.map((chipText, i) => (
                          <Pressable
                            key={i}
                            onPress={() => handleAsk(chipText)}
                            style={({ pressed }) => [
                              styles.followUpChip,
                              pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
                            ]}
                          >
                            <Text style={styles.followUpChipText}>{chipText}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {loading && (
            <View style={styles.loadingRow}>
              <View style={styles.botAvatarBadge}>
                <MaterialCommunityIcons name="robot-happy" size={15} color="#C58882" />
              </View>
              <View style={styles.loadingBubble}>
                <Orb size={18} state="reasoning" color="#C58882" />
                <Text style={styles.loadingText}>Reasoning over your records...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Floating Capsule Input */}
        <View
          style={[
            styles.floatingInputWrapper,
            {
              paddingBottom: isKeyboardVisible
                ? (Platform.OS === 'ios' ? 12 : 8)
                : (Platform.OS === 'ios' ? 96 : 86),
            },
          ]}
          pointerEvents="box-none"
        >
          <GlassView
            cornerRadius={28}
            variant="regular"
            tint="rgba(255, 255, 255, 0.88)"
            style={styles.inputCapsule}
          >
            <SearchIcon size={18} color="#C58882" />
            <TextInput
              placeholder={isListening ? `Listening... (${voiceSeconds}s) Tap mic to send` : "Ask your Daybook..."}
              placeholderTextColor={isListening ? "#C58882" : "#A8A29E"}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => handleAsk(query)}
              returnKeyType="send"
              style={styles.input}
            />
            {/* Voice Mic Button */}
            <Pressable
              onPress={handleToggleVoice}
              hitSlop={8}
              style={({ pressed }) => [
                styles.micButton,
                isListening && styles.micButtonActive,
                pressed && { opacity: 0.8, transform: [{ scale: 0.94 }] },
              ]}
            >
              {isListening ? (
                <StopIcon size={16} color="#FFFFFF" />
              ) : (
                <MicIcon size={18} color="#C58882" strokeWidth={2} />
              )}
            </Pressable>
            <Pressable
              onPress={() => handleAsk(query)}
              disabled={!query.trim() || loading}
              style={({ pressed }) => [
                styles.sendButton,
                (!query.trim() || loading) && styles.sendButtonDisabled,
                pressed && { opacity: 0.85, transform: [{ scale: 0.94 }] },
              ]}
            >
              <SendArrowIcon size={16} color="#FFFFFF" />
            </Pressable>
          </GlassView>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEAE5',
    backgroundColor: '#FAF8F4',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF0EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EFE4DD',
  },
  avatarImage: {
    width: 26,
    height: 26,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#34312F',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11.5,
    color: '#88827E',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resetBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  chatScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 140 : 130,
  },
  messageRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  botAvatarBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAF0EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  userBubbleContainer: {
    maxWidth: '82%',
    alignSelf: 'flex-end',
  },
  assistantContentContainer: {
    flex: 1,
    paddingRight: 4,
  },
  bubble: {
    padding: 14,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#C58882',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEAE5',
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    maxWidth: '96%',
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: '#34312F',
  },
  richTasksWrapper: {
    marginTop: 12,
    gap: 8,
  },
  taskMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F4',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  taskCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C58882',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  taskCheckCircleDone: {
    backgroundColor: '#8DB580',
    borderColor: '#8DB580',
  },
  taskMiniInfo: {
    flex: 1,
  },
  taskMiniTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34312F',
  },
  taskMiniTitleDone: {
    textDecorationLine: 'line-through',
    color: '#A8A29E',
  },
  taskMiniDue: {
    fontSize: 11,
    color: '#88827E',
    marginTop: 1,
  },
  priorityPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  priorityPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardActionLink: {
    marginTop: 6,
    paddingVertical: 4,
  },
  cardActionLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C58882',
  },
  richFinanceWrapper: {
    marginTop: 12,
    backgroundColor: '#FAF8F4',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  financeBalanceRow: {
    marginBottom: 8,
  },
  financeBalanceLabel: {
    fontSize: 11,
    color: '#88827E',
    fontWeight: '500',
  },
  financeBalanceVal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34312F',
  },
  financeMetricsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  financeMetricPill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: '#EEEAE5',
    alignItems: 'center',
  },
  financeMetricTag: {
    fontSize: 10,
    color: '#88827E',
  },
  financeMetricNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34312F',
    marginTop: 1,
  },
  richProductsWrapper: {
    marginTop: 10,
    gap: 6,
  },
  productMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF8F4',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  productMiniLeft: {
    flex: 1,
    marginRight: 8,
  },
  productMiniName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34312F',
  },
  productMiniBrand: {
    fontSize: 11,
    color: '#88827E',
  },
  productPricePill: {
    backgroundColor: '#FAF0EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  productPriceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C58882',
  },
  richNotesWrapper: {
    marginTop: 10,
    gap: 6,
  },
  noteMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F4',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  noteMiniInfo: {
    flex: 1,
    marginHorizontal: 8,
  },
  noteMiniTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34312F',
  },
  noteMiniExcerpt: {
    fontSize: 11,
    color: '#88827E',
  },
  richMoodWrapper: {
    marginTop: 10,
    gap: 6,
  },
  moodMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F4',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  moodMiniBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FAF0EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  moodMiniInfo: {
    flex: 1,
  },
  moodMiniTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34312F',
  },
  moodMiniNote: {
    fontSize: 11,
    color: '#88827E',
    fontStyle: 'italic',
  },
  moodMiniDate: {
    fontSize: 11,
    color: '#88827E',
  },
  followUpsRow: {
    marginTop: 8,
    marginRight: -16,
  },
  followUpsScroll: {
    gap: 8,
    paddingVertical: 2,
    paddingRight: 24,
  },
  followUpChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followUpChipText: {
    fontSize: 12,
    color: '#34312F',
    fontWeight: '500',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEAE5',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#88827E',
    fontStyle: 'italic',
  },
  floatingInputWrapper: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 96 : 86,
    backgroundColor: 'transparent',
  },
  inputCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 28,
    height: 52,
    paddingLeft: 16,
    paddingRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(238, 234, 229, 0.85)',
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#34312F',
  },
  micButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FAF0EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  micButtonActive: {
    backgroundColor: '#D4736C',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#C58882',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
});
