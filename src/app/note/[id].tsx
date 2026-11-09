import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { audioService } from '../../utils/audio';
import { haptic } from '../../utils/haptics';
import {
  ChevronLeftIcon,
  HeartIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  MicIcon,
  StopIcon,
} from '../../components/icons';
import {
  notesRepository,
  collectionsRepository,
  CollectionItem,
} from '../../database/repositories';

export default function NoteEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const isNew = id === 'new';
  const [noteId, setNoteId] = useState<string | null>(isNew ? null : id);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const audioPlayerRef = useRef<any>(null);
  const recordingSessionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    setCollections(collectionsRepository.getAll());

    if (!isNew && id) {
      const existing = notesRepository.getById(id);
      if (existing) {
        setTitle(existing.title);
        setContent(existing.content || '');
        setCollectionId(existing.collectionId);
        setIsFavorite(existing.isFavorite === 1);
        if (existing.voiceUri) {
          setVoiceUri(existing.voiceUri);
        }
      }
    }

    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.stop().catch(() => {});
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordingSessionRef.current) {
        recordingSessionRef.current.stop().catch(() => {});
      }
    };
  }, [id, isNew]);

  const handleToggleRecordVoice = async () => {
    if (isRecording) {
      // Stop recording
      haptic.impact();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRecording(false);
      const session = recordingSessionRef.current;
      if (session) {
        const res = await session.stop();
        recordingSessionRef.current = null;
        if (res.uri) {
          setVoiceUri(res.uri);
          if (noteId) {
            notesRepository.addAttachment(noteId, {
              type: 'voice',
              uri: res.uri,
              fileName: `voice_${Date.now()}.wav`,
            });
          }
          haptic.success();
          Alert.alert('Voice Note Saved', 'Audio reflection has been attached to this note.');
        }
      }
      setRecordingSeconds(0);
    } else {
      // Start recording
      haptic.impact();
      const hasPerm = await audioService.requestPermissions();
      if (!hasPerm) {
        Alert.alert('Microphone Permission', 'Please enable microphone access in settings.');
        return;
      }
      const session = await audioService.startVoiceRecording();
      recordingSessionRef.current = session;
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleTogglePlayVoice = async () => {
    if (!voiceUri) return;

    haptic.selection();

    if (isPlayingAudio) {
      if (audioPlayerRef.current) {
        await audioPlayerRef.current.stop().catch(() => {});
        audioPlayerRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      const player = await audioService.playAudio(voiceUri, () => {
        setIsPlayingAudio(false);
        audioPlayerRef.current = null;
      });

      if (player) {
        audioPlayerRef.current = player;
        setIsPlayingAudio(true);
      } else {
        Alert.alert(
          'Playback Ready',
          'Voice playback is active when running in development build.'
        );
      }
    } catch (err) {
      console.error('Failed to play voice note:', err);
      setIsPlayingAudio(false);
    }
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      router.back();
      return;
    }

    const noteTitle = title.trim() || 'Untitled Note';

    if (noteId) {
      notesRepository.update(noteId, {
        title: noteTitle,
        content: content.trim(),
        collectionId,
        isFavorite,
      });
    } else {
      const created = notesRepository.create({
        title: noteTitle,
        content: content.trim(),
        collectionId,
        isFavorite,
      });
      if (voiceUri) {
        notesRepository.addAttachment(created.id, {
          type: 'voice',
          uri: voiceUri,
          fileName: `voice_${Date.now()}.wav`,
        });
      }
      setNoteId(created.id);
    }

    router.back();
  };

  const handleDelete = () => {
    if (noteId) {
      notesRepository.delete(noteId);
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <Pressable onPress={handleSave} hitSlop={12} style={styles.backButton}>
          <ChevronLeftIcon size={24} color="#34312F" />
        </Pressable>

        <View style={styles.actionsRight}>
          {/* Voice Memo Recording Button */}
          <Pressable
            onPress={handleToggleRecordVoice}
            hitSlop={8}
            style={[styles.actionIcon, isRecording && styles.actionIconRecording]}
          >
            {isRecording ? (
              <View style={styles.recordingPillActive}>
                <View style={styles.recordingPulseDot} />
                <Text style={styles.recordingTimeText}>
                  {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                </Text>
                <StopIcon size={14} color="#FFFFFF" />
              </View>
            ) : (
              <MicIcon size={20} color={voiceUri ? '#C58882' : '#88827E'} strokeWidth={2} />
            )}
          </Pressable>

          <Pressable
            onPress={() => setIsFavorite(!isFavorite)}
            hitSlop={12}
            style={styles.actionIcon}
          >
            <HeartIcon
              size={22}
              color={isFavorite ? '#C58882' : '#88827E'}
              filled={isFavorite}
            />
          </Pressable>

          {!isNew && (
            <Pressable
              onPress={handleDelete}
              hitSlop={12}
              style={styles.actionIcon}
            >
              <TrashIcon size={20} color="#D4736C" />
            </Pressable>
          )}

          <Pressable onPress={handleSave} style={styles.doneButton}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      </View>

      {/* Fixed compact Collections Selector Bar (does NOT stretch vertically!) */}
      <View style={styles.collectionsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collectionsBar}
        >
          <Pressable
            onPress={() => setCollectionId(null)}
            style={[
              styles.colChip,
              collectionId === null && styles.activeColChip,
            ]}
          >
            <Text
              style={[
                styles.colChipText,
                collectionId === null && styles.activeColChipText,
              ]}
            >
              No Collection
            </Text>
          </Pressable>

          {collections.map((col) => {
            const isSelected = collectionId === col.id;
            return (
              <Pressable
                key={col.id}
                onPress={() => setCollectionId(col.id)}
                style={[
                  styles.colChip,
                  isSelected && {
                    backgroundColor: col.color || '#C58882',
                    borderColor: col.color || '#C58882',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.colChipText,
                    isSelected && styles.activeColChipText,
                  ]}
                >
                  {col.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Editor Body */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Voice Memo Audio Capsule */}
          {voiceUri && (
            <View style={styles.voicePlayerCard}>
              <Pressable
                onPress={handleTogglePlayVoice}
                style={({ pressed }) => [
                  styles.voicePlayerPlayBtn,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] },
                ]}
              >
                {isPlayingAudio ? (
                  <PauseIcon size={16} color="#FFFFFF" />
                ) : (
                  <PlayIcon size={16} color="#FFFFFF" />
                )}
              </Pressable>
              <View style={styles.voicePlayerInfo}>
                <Text style={styles.voicePlayerHeading}>
                  {isPlayingAudio ? 'Playing voice thought...' : 'Recorded Voice Reflection'}
                </Text>
                <Text style={styles.voicePlayerSub}>
                  {isPlayingAudio ? 'Tap button to pause' : 'Tap play to listen'}
                </Text>
              </View>
              <View style={styles.voicePlayerMicBadge}>
                <MicIcon size={14} color="#C58882" />
              </View>
            </View>
          )}

          {/* Title Input */}
          <TextInput
            placeholder="Title"
            placeholderTextColor="#B5AFA8"
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
            returnKeyType="next"
          />

          {/* Body Content Input */}
          <TextInput
            placeholder="Start writing thoughts, routines, lists, or memories..."
            placeholderTextColor="#B5AFA8"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            style={styles.contentInput}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEAE5',
    backgroundColor: '#FAF8F4',
  },
  backButton: {
    padding: 6,
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    padding: 6,
  },
  doneButton: {
    backgroundColor: '#C58882',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
  },
  doneText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  collectionsWrapper: {
    height: 48,
    backgroundColor: '#FAF8F4',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE6',
    justifyContent: 'center',
  },
  collectionsBar: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  colChip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeColChip: {
    backgroundColor: '#34312F',
    borderColor: '#34312F',
  },
  colChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#88827E',
  },
  activeColChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  titleInput: {
    fontSize: 26,
    fontWeight: '800',
    color: '#34312F',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  contentInput: {
    fontSize: 16,
    color: '#34312F',
    lineHeight: 24,
    minHeight: 300,
  },
  voicePlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF0EB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFE2DB',
    gap: 12,
  },
  voicePlayerPlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#C58882',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voicePlayerInfo: {
    flex: 1,
  },
  voicePlayerHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34312F',
  },
  voicePlayerSub: {
    fontSize: 12,
    color: '#88827E',
    marginTop: 2,
  },
  voicePlayerMicBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE4DD',
  },
  actionIconRecording: {
    backgroundColor: 'transparent',
  },
  recordingPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4736C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 5,
  },
  recordingPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  recordingTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
