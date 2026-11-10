import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { haptic } from '../../utils/haptics';
import { audioService } from '../../utils/audio';
import { VolumeHighIcon, VolumeMuteIcon } from '../icons';
import { notesRepository } from '../../database/repositories';
import { format } from 'date-fns';

interface MeditationModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.52;

type BreathPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

export function MeditationModal({ visible, onClose, onSaved }: MeditationModalProps) {
  const [phase, setPhase] = useState<BreathPhase>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const soundEnabledRef = useRef(true);
  soundEnabledRef.current = soundEnabled;

  const ambientPlayerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const phasePlayerRef = useRef<{ stop: () => Promise<void> } | null>(null);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const intervalRef = useRef<any>(null);

  const stopAllAudio = () => {
    if (phasePlayerRef.current) {
      phasePlayerRef.current.stop().catch(() => {});
      phasePlayerRef.current = null;
    }
    if (ambientPlayerRef.current) {
      ambientPlayerRef.current.stop().catch(() => {});
      ambientPlayerRef.current = null;
    }
  };

  const playPhaseSound = async (phaseName: BreathPhase) => {
    if (!soundEnabledRef.current) return;
    try {
      if (phasePlayerRef.current) {
        await phasePlayerRef.current.stop();
      }
      phasePlayerRef.current = await audioService.playBreathCue(phaseName);
    } catch {}
  };

  const startAmbientLoop = async () => {
    if (!soundEnabledRef.current) return;
    try {
      if (!ambientPlayerRef.current) {
        ambientPlayerRef.current = await audioService.startMeditationAmbient();
      }
    } catch {}
  };

  const toggleSound = () => {
    haptic.selection();
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    soundEnabledRef.current = nextVal;

    if (nextVal) {
      startAmbientLoop();
      playPhaseSound(phase);
    } else {
      stopAllAudio();
    }
  };

  useEffect(() => {
    if (!visible) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopAllAudio();
      setPhase('Inhale');
      setSecondsLeft(4);
      setCyclesCompleted(0);
      return;
    }

    haptic.impact();
    let currentPhase: BreathPhase = 'Inhale';
    let count = 4;

    // Start peaceful ambient sound and initial inhale chime if audio is enabled
    if (soundEnabledRef.current) {
      startAmbientLoop();
      playPhaseSound('Inhale');
    }

    const animatePhase = (nextPhase: BreathPhase) => {
      if (nextPhase === 'Inhale') {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.18,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.95,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (nextPhase === 'Exhale') {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.78,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.45,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };

    animatePhase('Inhale');

    intervalRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        count = 4;
        if (currentPhase === 'Inhale') {
          currentPhase = 'Hold';
          haptic.selection();
        } else if (currentPhase === 'Hold') {
          currentPhase = 'Exhale';
          animatePhase('Exhale');
          haptic.selection();
        } else if (currentPhase === 'Exhale') {
          currentPhase = 'Rest';
          haptic.selection();
        } else {
          currentPhase = 'Inhale';
          animatePhase('Inhale');
          setCyclesCompleted((c) => c + 1);
          haptic.impact();
        }
        setPhase(currentPhase);
        if (soundEnabledRef.current) {
          playPhaseSound(currentPhase);
        }
      }
      setSecondsLeft(count);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopAllAudio();
    };
  }, [visible]);

  const handleFinishAndSave = () => {
    stopAllAudio();
    haptic.impact();
    const timeStr = format(new Date(), 'h:mm a');
    const dateStr = format(new Date(), 'MMMM d, yyyy');
    notesRepository.create({
      title: `Mindful Breathing (${timeStr})`,
      content: `Completed ${cyclesCompleted + 1} breath cycles on ${dateStr}.\n\nFeeling calm, centered, and fully present in the moment.`,
      collectionId: 'col-personal',
    });
    onSaved?.();
    onClose();
  };

  const handleClose = () => {
    stopAllAudio();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} hitSlop={12} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Done</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Guided Breath</Text>

          {/* Audio On / Off Toggle Pill */}
          <Pressable
            onPress={toggleSound}
            hitSlop={10}
            style={({ pressed }) => [
              styles.soundTogglePill,
              soundEnabled && styles.soundTogglePillActive,
              pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel={soundEnabled ? 'Mute mindful audio' : 'Enable mindful audio'}
          >
            {soundEnabled ? (
              <>
                <VolumeHighIcon size={15} color="#C58882" strokeWidth={2.2} />
                <Text style={styles.soundToggleTextActive}>Sound On</Text>
              </>
            ) : (
              <>
                <VolumeMuteIcon size={15} color="#88827E" strokeWidth={2} />
                <Text style={styles.soundToggleTextMuted}>Sound Off</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.centerWrap}>
          {/* Breathing Circle Visual */}
          <View style={styles.circleOuter}>
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            />
            <View style={styles.circleInnerContent}>
              <Text style={styles.phaseTitle}>{phase}</Text>
              <Text style={styles.secondsText}>{secondsLeft}s</Text>
            </View>
          </View>

          <Text style={styles.cycleCounter}>
            {cyclesCompleted} breath cycles completed
          </Text>
          <Text style={styles.guidanceHint}>
            {phase === 'Inhale' && 'Slowly breathe in through your nose...'}
            {phase === 'Hold' && 'Hold gently and soften your shoulders...'}
            {phase === 'Exhale' && 'Slowly release through your mouth...'}
            {phase === 'Rest' && 'Pause in stillness before the next breath...'}
          </Text>

          {/* Gentle Audio Indicator Badge */}
          <View style={styles.audioStatusBadge}>
            <Text style={styles.audioStatusText}>
              {soundEnabled
                ? 'Harmonic breath cues & singing bowl active'
                : 'Audio muted - Tap Sound On above for breath chimes'}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleFinishAndSave}
            style={({ pressed }) => [
              styles.logButton,
              pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={styles.logButtonText}>Finish & Save Reflection</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#88827E',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#34312F',
  },
  soundTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEAE4',
  },
  soundTogglePillActive: {
    backgroundColor: '#FAF0EB',
    borderColor: '#F0E2DA',
  },
  soundToggleTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C58882',
  },
  soundToggleTextMuted: {
    fontSize: 12,
    fontWeight: '600',
    color: '#88827E',
  },
  centerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  circleOuter: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  breathingCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#EADCD7',
    borderWidth: 2,
    borderColor: '#C58882',
  },
  circleInnerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#34312F',
    letterSpacing: -0.4,
  },
  secondsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#C58882',
    marginTop: 4,
  },
  cycleCounter: {
    fontSize: 14,
    color: '#88827E',
    fontWeight: '600',
    marginBottom: 8,
  },
  guidanceHint: {
    fontSize: 15,
    color: '#5A4036',
    textAlign: 'center',
    fontStyle: 'italic',
    minHeight: 24,
  },
  audioStatusBadge: {
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3EFEA',
  },
  audioStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#88827E',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  logButton: {
    backgroundColor: '#C58882',
    borderRadius: 24,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default MeditationModal;

