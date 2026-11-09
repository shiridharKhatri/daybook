import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Image,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { audioService } from '../../utils/audio';
import { haptic } from '../../utils/haptics';
import { QuickCaptureSheet, GlassView, MeditationModal } from '../../components/common';
import {
  PlusIcon,
  SearchIcon,
  MicIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  MoreHorizontalIcon,
} from '../../components/icons';
import {
  notesRepository,
  NoteItem,
  collectionsRepository,
  CollectionItem,
} from '../../database/repositories';
import { format } from 'date-fns';

const EMOTICON_THUMBS = [
  require('../../../assets/emoticons/sweet_smile.png'),
  require('../../../assets/emoticons/joyful_peach.png'),
  require('../../../assets/emoticons/peaceful_sad.png'),
  require('../../../assets/emoticons/cute_kitty.png'),
  require('../../../assets/emoticons/laughing_happy.png'),
  require('../../../assets/emoticons/kiss_love.png'),
  require('../../../assets/emoticons/playful_wink.png'),
];

export default function LibraryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ collection?: string }>();
  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>(params.collection || 'all');
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [showCapture, setShowCapture] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);

  // Sync param when navigating from tiles
  useEffect(() => {
    if (params.collection) {
      setSelectedCollection(params.collection);
    }
  }, [params.collection]);

  // Real Audio Recording State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const voiceSessionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Real Audio Playback State
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const audioPlayerRef = useRef<any>(null);

  const loadData = useCallback(() => {
    const cols = collectionsRepository.getAll();
    setCollections(cols);
    const list = notesRepository.getAll({
      collectionId: selectedCollection !== 'all' ? selectedCollection : undefined,
      search,
    });
    setNotes(list);
  }, [search, selectedCollection]);

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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (voiceSessionRef.current) {
        voiceSessionRef.current.stop().catch(() => {});
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleSearch = (txt: string) => {
    setSearch(txt);
    setNotes(notesRepository.getAll({ search: txt }));
  };

  const handleCreateGratitude = () => {
    haptic.impact();
    const today = format(new Date(), 'EEEE, MMMM d');
    const newNote = notesRepository.create({
      title: `Gratitude Journal (${today})`,
      content: '1. Three things I am deeply grateful for today:\n• \n• \n• \n\n2. Today\'s peaceful moment:\n• ',
      collectionId: 'col-personal',
    });
    router.push(`/note/${newNote.id}`);
  };

  const handleCreateReflection = () => {
    haptic.impact();
    const today = format(new Date(), 'MMMM d, yyyy');
    const newNote = notesRepository.create({
      title: `Inner Reflection (${today})`,
      content: 'What brought me energy today?\nWhat drained my focus?\nHow can I be kinder to myself tomorrow?',
      collectionId: 'col-learning',
    });
    router.push(`/note/${newNote.id}`);
  };

  // Real Audio Voice Recording
  const handleToggleVoiceRecording = async () => {
    if (isRecordingVoice) {
      // Stop recording
      try {
        haptic.impact();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsRecordingVoice(false);

        const currentSession = voiceSessionRef.current;
        let uri: string | null = null;
        let durationSec = recordingSeconds || 2;

        if (currentSession) {
          const res = await currentSession.stop();
          uri = res.uri;
          if (res.durationMillis) {
            durationSec = Math.max(1, Math.round(res.durationMillis / 1000));
          }
        }

        const durationFmt = `${Math.floor(durationSec / 60)}:${(durationSec % 60).toString().padStart(2, '0')}`;
        const timeStr = format(new Date(), 'h:mm a');

        const newNote = notesRepository.create({
          title: `Voice Thought (${timeStr})`,
          content: `Voice Reflection (${durationFmt})\nAudio recorded directly on your device.\n\n"A quiet moment of reflection, keeping thoughts grounded and priorities calm."`,
          collectionId: 'col-personal',
        });

        if (uri) {
          notesRepository.addAttachment(newNote.id, {
            type: 'voice',
            uri,
            fileName: `voice_${Date.now()}.m4a`,
          });
        }

        voiceSessionRef.current = null;
        setRecordingSeconds(0);
        loadData();

        Alert.alert(
          'Voice Thought Saved',
          `Recorded ${durationFmt} of reflection. Added to your past entries.`,
          [
            { text: 'Done', style: 'cancel' },
            { text: 'Play / Open', onPress: () => router.push(`/note/${newNote.id}`) },
          ]
        );
      } catch (err) {
        console.error('Failed to stop recording:', err);
        setIsRecordingVoice(false);
      }
    } else {
      // Start recording
      try {
        haptic.impact();
        const hasPerm = await audioService.requestPermissions();
        if (!hasPerm) {
          Alert.alert(
            'Microphone Permission Required',
            'Please allow microphone access in your device settings to record voice notes.'
          );
          return;
        }

        const session = await audioService.startVoiceRecording();
        voiceSessionRef.current = session;
        setIsRecordingVoice(true);
        setRecordingSeconds(0);

        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.error('Failed to start recording:', err);
        Alert.alert('Recording Unavailable', 'Could not initialize audio recorder.');
      }
    }
  };

  // Real Audio Playback for voice notes
  const handleTogglePlayNoteAudio = async (note: NoteItem) => {
    haptic.selection();

    // If currently playing this note, stop it
    if (playingNoteId === note.id) {
      if (audioPlayerRef.current) {
        await audioPlayerRef.current.stop().catch(() => {});
        audioPlayerRef.current = null;
      }
      setPlayingNoteId(null);
      return;
    }

    // If playing another note, stop first
    if (audioPlayerRef.current) {
      await audioPlayerRef.current.stop().catch(() => {});
      audioPlayerRef.current = null;
    }

    if (!note.voiceUri) {
      Alert.alert('No Audio File', 'This entry does not have a recorded voice memo file.');
      return;
    }

    try {
      const player = await audioService.playAudio(note.voiceUri, () => {
        setPlayingNoteId(null);
        audioPlayerRef.current = null;
      });

      if (player) {
        audioPlayerRef.current = player;
        setPlayingNoteId(note.id);
      } else {
        Alert.alert(
          'Audio Playback',
          'Voice file playback is ready when running in development build.'
        );
      }
    } catch (err) {
      console.error('Playback error:', err);
      setPlayingNoteId(null);
    }
  };

  const handleEntryOptions = (note: NoteItem) => {
    haptic.selection();
    Alert.alert(
      note.title,
      'Choose an action for this entry',
      [
        {
          text: note.isFavorite ? 'Unfavorite' : 'Mark as Favorite',
          onPress: () => {
            notesRepository.update(note.id, { isFavorite: !note.isFavorite });
            loadData();
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            notesRepository.delete(note.id);
            loadData();
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const formatDateLabel = (timestamp: number) => {
    try {
      return format(new Date(timestamp), 'MMMM d, yyyy');
    } catch {
      return 'Recent';
    }
  };

  const calculateReadTime = (content: string | null) => {
    if (!content) return '1';
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 45)).toString();
  };

  const formatRecordingTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header matching reference */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <Pressable
          onPress={() => {
            haptic.selection();
            setShowCapture(true);
          }}
          style={({ pressed }) => [
            styles.newEntryButton,
            pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
          ]}
        >
          <PlusIcon size={15} color="#34312F" strokeWidth={2.2} />
          <Text style={styles.newEntryText}>New Entry</Text>
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
        {/* Top 3 Equal Square Shelves */}
        <View style={styles.shelvesRow}>
          {/* Card 1: Quick Access */}
          <Pressable
            onPress={() => {
              haptic.selection();
              setShowCapture(true);
            }}
            style={({ pressed }) => [
              styles.shelfCard,
              { backgroundColor: '#FAF0EB' },
              pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Image
              source={EMOTICON_THUMBS[0]}
              style={styles.shelfIcon}
              resizeMode="contain"
            />
            <Text style={styles.shelfTitle}>{'Quick\nAccess'}</Text>
          </Pressable>

          {/* Card 2: Gratitude Journal */}
          <Pressable
            onPress={handleCreateGratitude}
            style={({ pressed }) => [
              styles.shelfCard,
              { backgroundColor: '#F6F3EC' },
              pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Image
              source={EMOTICON_THUMBS[1]}
              style={styles.shelfIcon}
              resizeMode="contain"
            />
            <Text style={styles.shelfTitle}>{'Gratitude\nJournal'}</Text>
          </Pressable>

          {/* Card 3: Inner Reflection */}
          <Pressable
            onPress={handleCreateReflection}
            style={({ pressed }) => [
              styles.shelfCard,
              { backgroundColor: '#EDF3F7' },
              pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Image
              source={EMOTICON_THUMBS[2]}
              style={styles.shelfIcon}
              resizeMode="contain"
            />
            <Text style={styles.shelfTitle}>{'Inner\nReflection'}</Text>
          </Pressable>
        </View>

        {/* Real Live Voice Note Card */}
        <Pressable
          onPress={handleToggleVoiceRecording}
          style={({ pressed }) => [
            styles.voiceCard,
            isRecordingVoice && styles.voiceCardRecording,
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
        >
          <View style={styles.voiceLeft}>
            <View style={styles.voiceTitleRow}>
              {isRecordingVoice && <View style={styles.recordingLiveDot} />}
              <Text
                style={[
                  styles.voiceTitle,
                  isRecordingVoice && { color: '#D4736C' },
                ]}
              >
                {isRecordingVoice
                  ? `Recording... ${formatRecordingTimer(recordingSeconds)}`
                  : 'Voice Note'}
              </Text>
            </View>
            <Text style={styles.voiceSub}>
              {isRecordingVoice
                ? 'Tap mic to finish & save recording'
                : 'Tap to record and transcribe your thoughts'}
            </Text>
          </View>
          <View
            style={[
              styles.voiceMicCircle,
              isRecordingVoice && styles.voiceMicCircleActive,
            ]}
          >
            {isRecordingVoice ? (
              <StopIcon size={16} color="#FFFFFF" />
            ) : (
              <MicIcon size={20} color="#34312F" strokeWidth={2} />
            )}
          </View>
        </Pressable>

        {/* Featured Spotlight Card: Guided Meditation */}
        <Pressable
          onPress={() => {
            haptic.impact();
            setShowMeditation(true);
          }}
          style={({ pressed }) => [
            styles.spotlightCard,
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
        >
          <View style={styles.spotlightLeft}>
            <View style={styles.spotlightBadge}>
              <Image
                source={EMOTICON_THUMBS[4]}
                style={styles.spotlightDoodle}
                resizeMode="contain"
              />
            </View>
            <View style={styles.spotlightTextWrap}>
              <Text style={styles.spotlightTitle}>Guided Meditation & Routines</Text>
              <Text style={styles.spotlightSub}>Find peace, stillness and calm</Text>
            </View>
          </View>
          <View style={styles.spotlightPlayBtn}>
            <PlayIcon size={13} color="#34312F" />
          </View>
        </Pressable>

        {/* Minimalist Search Bar with Liquid Glass */}
        <GlassView
          cornerRadius={22}
          variant="regular"
          tint="rgba(255, 255, 255, 0.85)"
          style={styles.searchWrap}
        >
          <SearchIcon size={16} color="#88827E" />
          <TextInput
            placeholder="Search past entries, notes, thoughts..."
            placeholderTextColor="#A8A29E"
            value={search}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
        </GlassView>

        {/* Collection Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collectionFiltersScroll}
        >
          <Pressable
            onPress={() => {
              haptic.selection();
              setSelectedCollection('all');
            }}
            style={[
              styles.collectionFilterChip,
              selectedCollection === 'all' && styles.collectionFilterChipActive,
            ]}
          >
            <Text
              style={[
                styles.collectionFilterChipText,
                selectedCollection === 'all' && styles.collectionFilterChipTextActive,
              ]}
            >
              All
            </Text>
          </Pressable>

          {collections.map((col) => {
            const isActive = selectedCollection === col.id;
            return (
              <Pressable
                key={col.id}
                onPress={() => {
                  haptic.selection();
                  setSelectedCollection(isActive ? 'all' : col.id);
                }}
                style={[
                  styles.collectionFilterChip,
                  isActive && styles.collectionFilterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.collectionFilterChipText,
                    isActive && styles.collectionFilterChipTextActive,
                  ]}
                >
                  {col.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Active Collection Filter Notice */}
        {selectedCollection !== 'all' && (
          <View style={styles.activeFilterBanner}>
            <Text style={styles.activeFilterBannerText}>
              Viewing {collections.find((c) => c.id === selectedCollection)?.name || 'Filtered'}
            </Text>
            <Pressable
              onPress={() => {
                haptic.selection();
                setSelectedCollection('all');
              }}
              hitSlop={8}
            >
              <Text style={styles.activeFilterClearText}>Show All</Text>
            </Pressable>
          </View>
        )}

        {/* Past Entries Section Header */}
        <View style={styles.pastEntriesHeader}>
          <Text style={styles.sectionTitle}>Past Entries</Text>
          <Text style={styles.sectionCount}>{notes.length} entries</Text>
        </View>

        {/* Past Entries List */}
        {notes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No matching entries</Text>
            <Text style={styles.emptySubtitle}>Try searching for another keyword or create a new entry.</Text>
          </View>
        ) : (
          notes.map((item, idx) => {
            const hasAudio = Boolean(item.voiceUri);
            const isPlaying = playingNoteId === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  haptic.selection();
                  router.push(`/note/${item.id}`);
                }}
                style={({ pressed }) => [
                  styles.entryCard,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
                ]}
              >
                {/* Left Thumbnail with cute watercolor emoticon matching reference */}
                <View style={styles.entryThumb}>
                  <Image
                    source={EMOTICON_THUMBS[idx % EMOTICON_THUMBS.length]}
                    style={styles.thumbImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Center Content */}
                <View style={styles.entryContent}>
                  <View style={styles.entryTitleRow}>
                    <Text style={styles.entryTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>

                  <Text style={styles.entryMeta}>
                    {formatDateLabel(item.updatedAt)} / {calculateReadTime(item.content)} min
                  </Text>

                  <Text style={styles.entryExcerpt} numberOfLines={2}>
                    {item.content || 'A day of small victories and quiet moments.'}
                  </Text>

                  {/* Playable Voice Memo Bar */}
                  {hasAudio && (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleTogglePlayNoteAudio(item);
                      }}
                      style={styles.voicePlayPill}
                    >
                      {isPlaying ? (
                        <PauseIcon size={12} color="#C58882" />
                      ) : (
                        <PlayIcon size={12} color="#C58882" />
                      )}
                      <Text style={styles.voicePlayPillText}>
                        {isPlaying ? 'Playing Audio' : 'Play Voice Thought'}
                      </Text>
                    </Pressable>
                  )}
                </View>

                {/* Right Action Menu */}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEntryOptions(item);
                  }}
                  hitSlop={12}
                  style={styles.entryMoreBtn}
                >
                  <MoreHorizontalIcon size={18} color="#88827E" />
                </Pressable>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Global Quick Capture Sheet */}
      <QuickCaptureSheet
        visible={showCapture}
        onClose={() => setShowCapture(false)}
        onSuccess={loadData}
      />

      {/* Guided Meditation Breath Modal */}
      <MeditationModal
        visible={showMeditation}
        onClose={() => setShowMeditation(false)}
        onSaved={loadData}
      />
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#34312F',
    letterSpacing: -0.5,
  },
  newEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEAE5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 4,
  },
  newEntryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34312F',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 90,
  },
  shelvesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  shelfCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  shelfIcon: {
    width: 44,
    height: 44,
    marginBottom: 8,
  },
  shelfTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#34312F',
    textAlign: 'center',
    lineHeight: 16,
  },
  voiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EEEAE5',
    marginBottom: 14,
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  voiceCardRecording: {
    borderColor: '#E5A8A2',
    backgroundColor: '#FFF5F3',
  },
  voiceLeft: {
    flex: 1,
  },
  voiceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recordingLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4736C',
  },
  voiceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34312F',
  },
  voiceSub: {
    fontSize: 12.5,
    color: '#88827E',
    marginTop: 2,
  },
  voiceMicCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#EEEAE5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF8F4',
  },
  voiceMicCircleActive: {
    backgroundColor: '#D4736C',
    borderColor: '#D4736C',
  },
  spotlightCard: {
    backgroundColor: '#FAF0EB',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EFE2DB',
  },
  spotlightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  spotlightBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EFE4DE',
  },
  spotlightDoodle: {
    width: 32,
    height: 32,
  },
  spotlightTextWrap: {
    flex: 1,
  },
  spotlightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34312F',
  },
  spotlightSub: {
    fontSize: 12,
    color: '#88827E',
    marginTop: 2,
  },
  spotlightPlayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#EEE4DE',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(238, 234, 229, 0.85)',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 42,
    paddingHorizontal: 10,
    fontSize: 13.5,
    color: '#34312F',
  },
  collectionFiltersScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  collectionFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  collectionFilterChipActive: {
    backgroundColor: '#34312F',
    borderColor: '#34312F',
  },
  collectionFilterChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#6E6965',
  },
  collectionFilterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeFilterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF0EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFE2DB',
  },
  activeFilterBannerText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#C58882',
  },
  activeFilterClearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#88827E',
    textDecorationLine: 'underline',
  },
  pastEntriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34312F',
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: 13,
    color: '#88827E',
    fontWeight: '500',
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEAE5',
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  entryThumb: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FAF8F4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0ECE6',
  },
  thumbImage: {
    width: 44,
    height: 44,
  },
  entryContent: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 6,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34312F',
  },
  entryMeta: {
    fontSize: 12,
    color: '#88827E',
    marginVertical: 2.5,
  },
  entryExcerpt: {
    fontSize: 13,
    color: '#6E6965',
    lineHeight: 18,
  },
  voicePlayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF0EB',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#EFE4DD',
  },
  voicePlayPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C58882',
  },
  entryMoreBtn: {
    padding: 6,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEAE5',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34312F',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#88827E',
    textAlign: 'center',
    marginTop: 4,
  },
});
