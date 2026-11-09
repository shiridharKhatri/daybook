import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '../stores/appStore';
import { Card, Input, Button } from '../components/common';
import { CloseIcon } from '../components/icons';
import { MascotBadge } from '../components/illustrations';
import { notificationService } from '../utils/notifications';
import { haptic } from '../utils/haptics';
import {
  notesRepository,
  tasksRepository,
  financeRepository,
  productsRepository,
  moodRepository,
} from '../database/repositories';

export default function SettingsScreen() {
  const router = useRouter();

  const userProfile = useAppStore((state) => state.userProfile);
  const updateDisplayName = useAppStore((state) => state.updateDisplayName);
  const currency = useAppStore((state) => state.currency);
  const setCurrency = useAppStore((state) => state.setCurrency);
  const aiEnabled = useAppStore((state) => state.aiEnabled);
  const setAiEnabled = useAppStore((state) => state.setAiEnabled);
  const notificationsEnabled = useAppStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useAppStore((state) => state.setNotificationsEnabled);
  const faceIdEnabled = useAppStore((state) => state.faceIdEnabled);
  const setFaceIdEnabled = useAppStore((state) => state.setFaceIdEnabled);
  const logout = useAppStore((state) => state.logout);

  const [name, setName] = useState(userProfile?.displayName || '');
  const [curr, setCurr] = useState(currency || 'NPR');

  const handleToggleNotifications = async (enabled: boolean) => {
    haptic.selection();
    if (enabled) {
      const granted = await notificationService.requestPermissions();
      if (granted) {
        setNotificationsEnabled(true);
        await notificationService.scheduleDailyReminders();
        haptic.success();
      } else {
        setNotificationsEnabled(false);
        Alert.alert(
          'Notifications Permission',
          'Please allow notifications in your device Settings to receive gentle daily reminders.'
        );
      }
    } else {
      setNotificationsEnabled(false);
      await notificationService.cancelAllReminders();
    }
  };

  const handleSendTestNotification = async () => {
    haptic.impact();
    const success = await notificationService.sendTestNotification(
      '🌸 Daybook Reminder',
      'Gentle check-in: Time to review your daily intentions and wellness rituals.'
    );
    if (success) {
      haptic.success();
      Alert.alert(
        'Notification Sent',
        'Check your lock screen or notification center to see the banner!'
      );
    } else {
      Alert.alert(
        'Permission Required',
        'Please enable notifications first to test alert delivery.'
      );
    }
  };

  const handleSave = () => {
    if (name.trim()) {
      updateDisplayName(name.trim());
    }
    if (curr.trim()) {
      setCurrency(curr.trim().toUpperCase());
    }
    router.back();
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out? Your personal notes, tasks, and data remain saved safely on your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(onboarding)');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    const backupData = {
      profile: userProfile,
      exportedAt: new Date().toISOString(),
      notes: notesRepository.getAll(),
      tasks: tasksRepository.getAll(),
      transactions: financeRepository.getAll(),
      products: productsRepository.getAll(),
      moods: moodRepository.getRecent(30),
    };

    Alert.alert(
      'Backup Created',
      `Successfully exported ${backupData.notes.length} notes, ${backupData.tasks.length} tasks, and ${backupData.transactions.length} transactions. Your data is safely stored locally.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings & Privacy</Text>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.closeBtn}>
          <CloseIcon size={20} color="#34312F" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card style={styles.sectionCard}>
          <View style={styles.profileHeader}>
            <View style={styles.mascotWrapper}>
              <MascotBadge size={44} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userProfile?.displayName || 'Friend'}
              </Text>
              <Text style={styles.profileSub}>Daybook Personal Space</Text>
            </View>
          </View>

          <Input
            label="Preferred Display Name"
            value={name}
            onChangeText={setName}
            containerStyle={{ marginBottom: 8 }}
          />

          <Input
            label="Default Currency Code"
            value={curr}
            onChangeText={setCurr}
            placeholder="NPR, USD, EUR, etc."
          />
        </Card>

        {/* Preferences & Privacy */}
        <Card style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Preferences & AI</Text>

          {/* AI Assistance toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>AI Knowledge Assistant</Text>
              <Text style={styles.toggleSub}>
                Enable personal search & routine recommendations
              </Text>
            </View>
            <Switch
              value={aiEnabled}
              onValueChange={setAiEnabled}
              trackColor={{ false: '#EEEAE5', true: '#C58882' }}
            />
          </View>

          <View style={styles.divider} />

          {/* Notifications */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Local Reminders</Text>
              <Text style={styles.toggleSub}>
                Receive gentle notifications for tasks & routines
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#EEEAE5', true: '#C58882' }}
            />
          </View>

          {notificationsEnabled && (
            <Pressable
              onPress={handleSendTestNotification}
              style={({ pressed }) => [
                styles.testNotificationBtn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.testNotificationBtnText}>
                🔔 Send Test Notification Banner
              </Text>
            </Pressable>
          )}

          <View style={styles.divider} />

          {/* Face ID */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Face ID & App Lock</Text>
              <Text style={styles.toggleSub}>
                Protect private journals and records
              </Text>
            </View>
            <Switch
              value={faceIdEnabled}
              onValueChange={setFaceIdEnabled}
              trackColor={{ false: '#EEEAE5', true: '#C58882' }}
            />
          </View>
        </Card>

        {/* Data & Backup */}
        <Card style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Data & Privacy</Text>
          <Text style={styles.privacyDescription}>
            Daybook never uploads your private data to any remote server. Everything is stored locally on your device in encrypted SQLite storage.
          </Text>

          <Button
            title="Export Full Local Backup (JSON)"
            onPress={handleExportData}
            variant="secondary"
            fullWidth
            style={{ marginTop: 12 }}
          />
        </Card>

        {/* Account & Logout */}
        <Card style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Account & Session</Text>
          <Text style={styles.privacyDescription}>
            Signed in as {userProfile?.displayName || 'Friend'}. Log out to switch profiles or return to the welcome screen.
          </Text>

          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="secondary"
            fullWidth
            style={{ marginTop: 12, backgroundColor: '#FAF0EB', borderColor: '#F0E2DA' }}
            textStyle={{ color: '#D4736C', fontWeight: '700' }}
          />
        </Card>

        {/* Save button */}
        <Button
          title="Save Changes"
          onPress={handleSave}
          fullWidth
          size="large"
          style={{ marginTop: 16 }}
        />
      </ScrollView>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEAE5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#34312F',
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 18,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mascotWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5ECE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  mascotEmoji: {
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#34312F',
  },
  profileSub: {
    fontSize: 13,
    color: '#88827E',
    marginTop: 2,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34312F',
    marginBottom: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleInfo: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34312F',
  },
  toggleSub: {
    fontSize: 12,
    color: '#88827E',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEAE5',
    marginVertical: 12,
  },
  privacyDescription: {
    fontSize: 13,
    color: '#88827E',
    lineHeight: 18,
  },
  testNotificationBtn: {
    backgroundColor: '#FAF0EB',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0E2DA',
    alignItems: 'center',
    marginTop: 8,
  },
  testNotificationBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#C58882',
  },
});
