import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../stores/appStore';
import { Button, Input, Card, Badge } from '../../components/common';
import { MindfulCharacter, MascotBadge } from '../../components/illustrations';
import { CheckIcon, HeartIcon, NoteIcon, CalendarIcon } from '../../components/icons';
import { haptic } from '../../utils/haptics';
import { notificationService } from '../../utils/notifications';

const MODULES = [
  { id: 'notes', label: 'Notes & Journal', desc: 'Reflections & collections', icon: 'book-open-outline' },
  { id: 'beauty', label: 'Hair & Skincare', desc: 'Routines & products', icon: 'flower-tulip-outline' },
  { id: 'tasks', label: 'Daily Rituals & Tasks', desc: 'Habits & priorities', icon: 'heart-outline' },
  { id: 'finance', label: 'Finance & Expenses', desc: 'Budgets & spending', icon: 'credit-card-outline' },
  { id: 'cycle', label: 'Cycle & Wellness', desc: 'Phases & self-care', icon: 'water-outline' },
  { id: 'shopping', label: 'Wishlist & Buys', desc: 'Products to try', icon: 'bag-personal-outline' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const setHasCompletedOnboarding = useAppStore(
    (state) => state.setHasCompletedOnboarding
  );
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const setNotificationsEnabled = useAppStore(
    (state) => state.setNotificationsEnabled
  );

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [displayName, setDisplayName] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'notes',
    'beauty',
    'tasks',
    'finance',
    'cycle',
    'shopping',
  ]);
  const [notifications, setNotifications] = useState(true);

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    const finalName = displayName.trim() || 'Friend';
    setUserProfile({
      id: 'user-default',
      displayName: finalName,
    });
    setNotificationsEnabled(notifications);
    if (notifications) {
      notificationService.requestPermissions().then((granted) => {
        if (granted) {
          notificationService.scheduleDailyReminders();
        }
      });
    }
    setHasCompletedOnboarding(true);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* Step 1: Welcome Screen */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.brandContainer}>
                <View style={styles.brandPill}>
                  <Text style={styles.brandTitle}>DAYBOOK</Text>
                </View>
                <Text style={styles.heroHeading}>
                  Make space for{'\n'}everything that matters.
                </Text>
                <Text style={styles.subtitle}>
                  Your private, mindful space for reflection, daily routines & self-care.
                </Text>
              </View>

              <View style={styles.illustrationWrapper}>
                <View style={styles.auraGlow} />
                <Image
                  source={require('../../../assets/images/meditation.png')}
                  style={styles.heroImage}
                  resizeMode="contain"
                />
              </View>

              {/* Aesthetic Feature Micro-Capsules */}
              <View style={styles.featurePillsRow}>
                <View style={styles.featurePill}>
                  <HeartIcon size={13} color="#C58882" />
                  <Text style={styles.featurePillText}>Daily Rituals</Text>
                </View>
                <View style={styles.featurePill}>
                  <NoteIcon size={13} color="#C58882" />
                  <Text style={styles.featurePillText}>Private Journal</Text>
                </View>
                <View style={styles.featurePill}>
                  <CalendarIcon size={13} color="#C58882" />
                  <Text style={styles.featurePillText}>Cycle & Wellness</Text>
                </View>
              </View>

              <View style={styles.step1BottomWrapper}>
                <Button
                  title="Get Started"
                  onPress={() => setStep(2)}
                  size="large"
                  fullWidth
                />
                <View style={styles.footerNoteRow}>
                  <CheckIcon size={13} color="#8DB580" strokeWidth={2.6} />
                  <Text style={styles.footerNoteText}>100% on-device & encrypted storage</Text>
                </View>
              </View>
            </View>
          )}

          {/* Step 2: Name & Personalization */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.headerBlock}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>Step 2 of 3</Text>
                </View>
                <Text style={styles.stepHeading}>What should we call you?</Text>
                <Text style={styles.subtitle}>
                  Your name personalizes your daily overview and journals.
                </Text>
              </View>

              {/* Name Input Capsule */}
              <View style={styles.nameInputContainer}>
                <View style={styles.nameInputIcon}>
                  <MaterialCommunityIcons name="account-outline" size={20} color="#C58882" />
                </View>
                <TextInput
                  placeholder="Your preferred name (e.g. Amelia)"
                  placeholderTextColor="#A8A29E"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  returnKeyType="done"
                  style={styles.nameTextInput}
                />
              </View>

              {/* Module Customization Grid */}
              <View style={styles.modulesHeaderRow}>
                <Text style={styles.modulesSectionTitle}>Customize your Daybook</Text>
                <Text style={styles.modulesSectionSub}>Tap to select focus areas</Text>
              </View>

              <View style={styles.modulesGrid}>
                {MODULES.map((m) => {
                  const isChecked = selectedModules.includes(m.id);
                  return (
                    <Pressable
                      key={m.id}
                      onPress={() => {
                        haptic.selection();
                        toggleModule(m.id);
                      }}
                      style={({ pressed }) => [
                        styles.moduleCard,
                        isChecked && styles.moduleCardSelected,
                        pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
                      ]}
                    >
                      <View style={styles.moduleCardTop}>
                        <View
                          style={[
                            styles.moduleIconBadge,
                            isChecked && styles.moduleIconBadgeSelected,
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={m.icon as any}
                            size={18}
                            color={isChecked ? '#C58882' : '#88827E'}
                          />
                        </View>
                        <View
                          style={[
                            styles.miniCheckCircle,
                            isChecked && styles.miniCheckCircleActive,
                          ]}
                        >
                          {isChecked && <CheckIcon size={10} color="#FFFFFF" strokeWidth={3} />}
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.moduleCardTitle,
                          isChecked && styles.moduleCardTitleSelected,
                        ]}
                      >
                        {m.label}
                      </Text>
                      <Text style={styles.moduleCardDesc} numberOfLines={1}>
                        {m.desc}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Button
                title="Continue"
                onPress={() => {
                  haptic.selection();
                  setStep(3);
                }}
                size="large"
                fullWidth
                style={{ marginTop: 16 }}
              />
            </View>
          )}

          {/* Step 3: Minimalist Seamless Completion */}
          {step === 3 && (
            <View style={styles.step3Container}>
              <View style={styles.step3TextContainer}>
                <View style={styles.step3WelcomeBadge}>
                  <Text style={styles.step3WelcomeBadgeText}>Ready to Begin</Text>
                </View>
                <Text style={styles.step3Title}>
                  Welcome, {displayName.trim() || 'Friend'}
                </Text>
                <Text style={styles.step3Subtitle}>
                  Your personal space is prepared. Take a gentle breath and start your journey.
                </Text>
              </View>

              <View style={styles.step3Hero}>
                <Image
                  source={require('../../../assets/images/meditation.png')}
                  style={styles.step3Image}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.seamlessToggleRow}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={styles.seamlessToggleTitle}>Daily Reminders</Text>
                  <Text style={styles.seamlessToggleSub}>
                    Gentle morning check-ins and evening reflections
                  </Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={(val) => {
                    haptic.selection();
                    setNotifications(val);
                  }}
                  trackColor={{ false: '#E4DDD5', true: '#C58882' }}
                />
              </View>

              <View style={styles.step3Bottom}>
                <Button
                  title="Enter Daybook"
                  onPress={() => {
                    haptic.success();
                    handleFinish();
                  }}
                  size="large"
                  fullWidth
                />
                <Text style={styles.step3Footnote}>
                  100% private | Saved securely on this device
                </Text>
              </View>
            </View>
          )}
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  brandPill: {
    backgroundColor: '#FAF0EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0E2DA',
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: '#C58882',
    textTransform: 'uppercase',
  },
  heroHeading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#34312F',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: '#88827E',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 310,
    alignSelf: 'center',
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  auraGlow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#F5ECE7',
  },
  heroImage: {
    width: 280,
    height: 280,
  },
  featurePillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 10,
    flexWrap: 'wrap',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEAE5',
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  featurePillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#34312F',
  },
  step1BottomWrapper: {
    marginTop: 4,
    gap: 10,
  },
  footerNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerNoteText: {
    fontSize: 11.5,
    color: '#88827E',
    fontWeight: '500',
  },
  headerBlock: {
    marginTop: 8,
    marginBottom: 16,
  },
  stepBadge: {
    alignSelf: 'center',
    backgroundColor: '#FAF0EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0E2DA',
    marginBottom: 10,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C58882',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  stepHeading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#34312F',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EEEAE5',
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 20,
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  nameInputIcon: {
    marginRight: 10,
  },
  nameTextInput: {
    flex: 1,
    fontSize: 15,
    color: '#34312F',
    fontWeight: '600',
  },
  modulesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  modulesSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34312F',
    letterSpacing: -0.2,
  },
  modulesSectionSub: {
    fontSize: 11.5,
    color: '#88827E',
    fontWeight: '500',
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moduleCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#EEEAE5',
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  moduleCardSelected: {
    borderColor: '#C58882',
    backgroundColor: '#FCFAF8',
  },
  moduleCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  moduleIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF8F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIconBadgeSelected: {
    backgroundColor: '#FAF0EB',
  },
  miniCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#DDD6CE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  miniCheckCircleActive: {
    backgroundColor: '#C58882',
    borderColor: '#C58882',
  },
  moduleCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34312F',
    marginBottom: 2,
  },
  moduleCardTitleSelected: {
    color: '#34312F',
  },
  moduleCardDesc: {
    fontSize: 11,
    color: '#88827E',
  },
  step3Container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  step3TextContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  step3WelcomeBadge: {
    backgroundColor: '#FAF0EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0E2DA',
    marginBottom: 8,
  },
  step3WelcomeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C58882',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  step3Title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#34312F',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  step3Subtitle: {
    fontSize: 14,
    color: '#88827E',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
  },
  step3Hero: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  step3Image: {
    width: 220,
    height: 220,
  },
  seamlessToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EDE7E1',
    marginVertical: 20,
  },
  seamlessToggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34312F',
  },
  seamlessToggleSub: {
    fontSize: 12,
    color: '#88827E',
    marginTop: 2,
    lineHeight: 16,
  },
  step3Bottom: {
    gap: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  step3Footnote: {
    fontSize: 11.5,
    color: '#A8A29E',
    fontWeight: '500',
  },
});
